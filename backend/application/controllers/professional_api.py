from application.controllers.api import *

class ProfessionalHome(Resource):
        
    def get(self, user_id):
        print(f"Fetching user with ID: {user_id}")
        user = User.query.get_or_404(user_id)
        professional = Professional.query.filter_by(id=user.id).first_or_404()
        print(f"Fetching professional with ID: {user.id}")


        requests = {
            "pending": "pending",
            "accepted": "accepted",
            "completed": "completed",
        }
        
        response_data = {
            "user": user.to_dict(),
            "professional": professional.to_dict(),
        }

        for key, status in requests.items():
            response_data[f"{key}_requests"] = [
                req.to_dict()
                for req in ServiceRequest.query.filter_by(professional_id=user_id, service_status=status)
                .order_by(ServiceRequest.date_of_request.desc())
                .all()
            ]


        return jsonify(response_data)

    def put(self, user_id):
        parser = reqparse.RequestParser()
        parser.add_argument("username", type=str)
        parser.add_argument("name", type=str)
        parser.add_argument("email", type=str)
        parser.add_argument("phone_number", type=str)
        parser.add_argument("address", type=str)
        parser.add_argument("pincode", type=str)
        parser.add_argument("experience", type=int)
        # parser.add_argument("status", type=str)
        # parser.add_argument("ratings", type=float)
        # parser.add_argument("review", type=str)
        args = parser.parse_args()

        user = User.query.get_or_404(user_id)
        professional = Professional.query.filter_by(id=user.id).first_or_404()

        for key, value in args.items():
            if value is not None:
                setattr(user if hasattr(user, key) else professional, key, value)

        try:
            db.session.commit()
            return jsonify({"status": "success", "message": "Profile updated successfully!"})
        except Exception as e:
            db.session.rollback()
            return jsonify({"status": "error", "message": str(e)})
# { "accepted_requests": [{},{}..],
#   "completed_requests": [],
#   "pending_requests": [],
#   "professional": {},
#   "user": {}}

class ServiceRequestAction(Resource):
    # method_decorators = [professional_required]
    # @jwt_required()
    def post(self, user_id, request_id, action):
        if action not in ["accept", "reject"]:
            return {"error": "Invalid action"}, 400

        # Fetch the service request and check if it belongs to the current user
        service_request = ServiceRequest.query.filter_by(id=request_id, professional_id=user_id).first_or_404()
        # Assuming the service request has a 'professional_id' field
        if action == "accept":
            service_request.service_status = "accepted"
        elif action == "reject":
            service_request.service_status = "rejected"
        db.session.commit()

        return {"message": f"Request {action}ed successfully"}

class ProfessionalSearch(Resource):  
    #can search for its Service requests only via customer fields, service_name, service reques fields
    #will return all the values assoiciated with service req

    def get(self, user_id):
        search_type = request.args.get("search_type")
        query = request.args.get("query")

        # If no search type or query, return all service requests for this professional
        if not search_type and not query:
            service_requests = ServiceRequest.query.filter_by(professional_id=user_id).all()
            return jsonify({"requests": [sr.to_dict() for sr in service_requests]})

        search_map = {
            "Service": (Service, ["name"]),  
            "Service Request": (ServiceRequest, ["service_status"]),  
            "Customer": (User, ["username", "email"])  
        }

        if search_type not in search_map:
            return jsonify({"error": "Invalid search type"})

        model, extra_fields = search_map[search_type]
        filters = [getattr(model, field).ilike(f"%{query}%") for field in extra_fields if hasattr(model, field)]

        if search_type == "Customer":
            # Restrict to Customers linked via ServiceRequest and return ServiceRequest details
            results = (
                ServiceRequest.query
                .join(User, ServiceRequest.customer_id == User.id)
                .filter(ServiceRequest.professional_id == user_id, or_(*filters))
                .all()
            )
            return jsonify({"requests": [sr.to_dict() for sr in results]})
        
        if search_type == "Service":
            # Find ServiceRequests where the service name matches
            service_requests = (
                ServiceRequest.query
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.professional_id == user_id, Service.name.ilike(f"%{query}%"))
                .all()
            )
            return jsonify({"requests": [sr.to_dict() for sr in service_requests]})

        if search_type == "Service Request":
            # Search only ServiceRequests linked to the professional
            results = (
                ServiceRequest.query.filter(ServiceRequest.professional_id == user_id)
                .filter(or_(*filters))
                .all()
            )
            return jsonify({"requests": [sr.to_dict() for sr in results]})

        return jsonify({"error": "Invalid request"})

class ProfessionalSummary(Resource):
    # method_decorators = [professional_required]

    def get(self, user_id):
        professional = Professional.query.get(user_id)
        if not professional:
            return jsonify({"error": "Professional not found"}), 404

        # Get ratings
        ratings = db.session.query(ServiceRequest.rating).filter_by(professional_id=professional.id).all()
    
        rating_counts = [0] * 5  # 1 to 5 stars
        for rating in ratings:
            if rating[0] is not None:
                rating_counts[rating[0] - 1] += 1

        valid_ratings = [rating[0] for rating in ratings if rating[0] is not None]  # Filter out None values
        average_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0  # Avoid division by zero

        # Update ratings in DB
        professional.ratings = average_rating
        db.session.commit()

        # Get service request statuses
        statuses = db.session.query(ServiceRequest.service_status).filter_by(professional_id=professional.id).all()
        status_counts = {"pending": 0, "completed": 0, "rejected": 0, "accepted": 0}
        for status in statuses:
            if status[0] in status_counts:
                status_counts[status[0]] += 1

        return {
            "pie_chart_prof": str(self.generate_pie_chart_prof(rating_counts)),
            "bar_chart_prof": str(self.generate_bar_chart_prof(status_counts)),
            "average_rating": average_rating,
        }, 200

    def generate_pie_chart_prof(self, rating_counts):  
        labels = ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"]
        colors = ["#FF9999", "#FFCC99", "#FFFF99", "#99FF99", "#66B2FF"]
        
        # Convert values to float and replace NaN with 0
        rating_counts = [float(r) if (r is not None and not np.isnan(r)) else 0 for r in rating_counts]

        # Prevent empty pie chart error
        if sum(rating_counts) == 0:
            rating_counts[0] = 1  # Ensure at least one segment exists

        fig, ax = plt.subplots()
        ax.pie(rating_counts, labels=labels, colors=colors, autopct="%1.1f%%", startangle=90)
        ax.set_title("Ratings Distribution")

        path = f"static/charts/pie_chart_prof_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        fig.savefig(path)

        return path

    def generate_bar_chart_prof(self, status_counts):
        labels, values = zip(*status_counts.items())
        colors = ["#66B2FF", "#99FF99", "#FF9999"]

        fig, ax = plt.subplots()
        ax.bar(labels, values, color=colors)
        ax.set_xlabel("Status")
        ax.set_ylabel("Number of Requests")
        ax.set_title("Service Request Status")

        path = f"static/charts/bar_chart_prof_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        os.makedirs(os.path.dirname(path), exist_ok=True)
        fig.savefig(path)

        return path
