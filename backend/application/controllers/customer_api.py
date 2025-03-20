from application.controllers.api import *

class CustomerHome(Resource):
    @jwt_required()
    def get(self, user_id):
        """Fetch customer details and service history."""
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "customer":
            return {"message": "Access denied. Customer only."}

        service_requests = ServiceRequest.query.filter_by(customer_id=user_id).all()

        service_data = [request.to_dict() for request in service_requests]
        print(service_data)

        response = {}
        response= {
            "customer_user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone_number": user.phone_number,
                "username": user.username,
                "pincode": user.pincode,
                "address": user.address
            },
            "service_history": service_data
        }

        return jsonify(response)
    
    @jwt_required()
    def put(self, user_id):
        """Update customer profile details."""
        data = request.json
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "customer":
            return {"message": "Access denied. Customer only."}

        # Check if email is already in use by another user (excluding the current user)
        if "email" in data and data["email"] != user.email:
            existing_user = User.query.filter_by(email=data["email"]).first()
            if existing_user and existing_user.id != user.id:
                return jsonify({"error": "Email already in use"})  # Bad request

        user.name = data.get("name", user.name)
        user.email = data.get("email", user.email)
        user.phone_number = data.get("phone_number", user.phone_number)  # Fix key name
        user.username = data.get("username", user.username)
        user.pincode = data.get("pincode", user.pincode)
        user.address = data.get("address", user.address)

        db.session.commit()
        return jsonify({"message": "Profile updated successfully!"})

class CustomerSearch(Resource):
    @jwt_required()
    def post(self, user_id):
        """Search professionals based on service, pincode, rating, or address."""
        
        if not request.data:  # ✅ Check for empty request at the beginning
            return jsonify({"error": "Empty request body"})

        data = request.json or {}  
        service_name = data.get('service_name')  
        pincode = data.get('pincode')  
        rating = data.get('rating')  
        address = data.get('address')  

        customer = User.query.get(user_id)
        if not customer:
            return jsonify({"error": "Customer not found"})

        # ✅ Default to customer's location if no params are provided
        if not (service_name or pincode or rating or address):
            address = customer.address
            pincode = customer.pincode

        service = Service.query.filter_by(name=service_name).first()
        if not service:
            return jsonify({'error': 'Service not found'})

        UserAlias = aliased(User)  # ✅ Fix ambiguous joins
        query = Professional.query.filter_by(service_id=service.id).join(UserAlias, Professional.id == UserAlias.id)

        if pincode:
            query = query.filter(UserAlias.pincode == pincode)
        if rating:
            query = query.filter(Professional.ratings >= float(rating))
        if address:
            query = query.filter(UserAlias.address.ilike(f"%{address}%"))

        professionals = query.all()

        results = [
            {
                "professional": professional.to_dict(),
                "user": professional.user.to_dict()  # ✅ Assuming relationship exists
            } for professional in professionals
        ]

        return jsonify({'professionals': results})
# {"professionals": [{"professional..1": {} ,"user..1": {}}...{}]}

class ServiceBooking(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('professional_id', type=int, required=True, help='Professional ID is required')
        self.reqparse.add_argument('service_id', type=int, required=True, help='Service ID is required')
        self.reqparse.add_argument('remarks', type=str)
        super(ServiceBooking, self).__init__()

    def post(self, user_id, service_id):
        args = self.reqparse.parse_args()
        professional_id = args['professional_id']
        service_id = args['service_id']
        remarks = args['remarks']

        existing_request = ServiceRequest.query.filter_by(
            customer_id=user_id,
            professional_id=professional_id,
            service_id=service_id,
            service_status="pending"
        ).first()

        if existing_request:
            return {"error": "You already have a pending request with this professional."}, 400

        service_request = ServiceRequest(
            customer_id=user_id,
            professional_id=professional_id,
            service_id=service_id,
            date_of_request=datetime.utcnow(),
            service_status='pending',
            remarks=remarks
        )

        try:
            db.session.add(service_request)
            db.session.commit()
            return {"message": "Service successfully booked!"}, 201
        except SQLAlchemyError as e:
            db.session.rollback()
            return {"error": "An error occurred while booking the service."}, 500

class ServiceClosure(Resource):
    #see prof- ratings,review,total_reviews vs  service_req - rating , rating
    
    def put(self, user_id, request_id):
        """Close a service request and provide feedback."""
        service_request = ServiceRequest.query.get(request_id)
        
        if not service_request:
            return jsonify({"error": "Service request not found."})

        if service_request.customer_id != user_id:
            return jsonify({"error": "Unauthorized action."})

        data = request.json
        rating = data.get('rating')
        review = data.get('review')
        try:
            rating = float(data.get('rating')) 
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid rating value. Must be a number."})
        if rating is None or review is None:
            return jsonify({"error": "Rating and review are required."})

        # Close the service request
        service_request.service_status = 'closed'
        service_request.date_of_completion = datetime.now()
        service_request.rating = rating
        service_request.review = review
        db.session.commit()

        # Update professional's rating
        professional = Professional.query.get(service_request.professional_id)
        if professional:
            total_reviews = professional.total_reviews + 1
            current_rating = professional.ratings or 0  # Handle None case
            professional.ratings = ((current_rating * professional.total_reviews) + rating) / total_reviews
            professional.total_reviews = total_reviews
            db.session.commit()

        return jsonify({"message": "Service request closed and review submitted successfully."})

class CustomerSummary(Resource):
    @jwt_required()
    def get(self, user_id):
        """Generate a summary of the customer's service requests."""
        
        logging.info(f"Fetching customerAdminSummary for user_id: {user_id}")
        
        cache_key = f"customer_summary_{user_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logging.info(f"Cache HIT for {user_id}")
            return cached_data 
        logging.info(f"Cache MISS for {user_id}")

        # customer_id = session.get('user_id')
        customer_id = user_id
        user = User.query.get(user_id)        
        if user.roles[0].name.lower() != "customer":
            return {"message": "Access denied. Customer only."}

        uniq = user.fs_uniquifier

        # Fetch status counts
        status_counts = db.session.query(ServiceRequest.service_status, db.func.count(ServiceRequest.id))\
            .filter(ServiceRequest.customer_id == customer_id)\
            .group_by(ServiceRequest.service_status)\
            .all()

        labels = [status for status, count in status_counts]
        counts = [int(count) for status, count in status_counts]

        bar_graph_path = self.generate_service_status_chart(labels, counts,uniq)
        
        response_data={'bar_graph_path': bar_graph_path}
        cache.set(cache_key, response_data, timeout=300)
        return jsonify(response_data)
    
    @staticmethod
    @cache.memoize(timeout=300)
    def generate_service_status_chart(labels, counts, uniq):
        
        """Generate a bar chart for service request status."""
        fig, ax = plt.subplots()
        ax.bar(labels, counts, color=['#FF9999', '#66B2FF', '#99FF99'])
        ax.set_xlabel('Service Request Status')
        ax.set_ylabel('Count')
        ax.set_title('Service Requests by Status')
        # ax.set_xticklabels(labels, ha="right")
        ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))

        # Define local file path
        chart_dir = os.path.join('static', 'charts')
        os.makedirs(chart_dir, exist_ok=True)  

        chart_filename = f'bar_chart_cust_{uniq}.png'
        chart_path = os.path.join(chart_dir, chart_filename)  

        # Save the chart to the local file system
        fig.savefig(chart_path, format='png')  

        # Generate the URL for frontend access
        bar_chart_url = url_for('routes.serve_chart', filename=chart_filename, _external=True)

        return bar_chart_url  # ✅ RETURN URL FOR FRONTEND USE

