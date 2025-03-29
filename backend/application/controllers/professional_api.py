from application.controllers.api import *
from sqlalchemy.orm import joinedload

class ProfessionalHome(Resource):
    @jwt_required()
    def get(self, user_id):
        print("Headers:", request.headers)
        print(f"Fetching Prof with ID: {user_id}")
        user = User.query.get_or_404(user_id)
        professional = Professional.query.filter_by(id=user.id).first_or_404()
        print(f"Fetching professional with ID: {user.id}")
        
        if user.roles[0].name.lower() != "professional":
            return {"message": "Access denied. Professionals only."}
        
        requests = {
            "pending": "pending",
            "accepted": "accepted",
            "closed": "closed",
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

    @jwt_required()
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
        
        if user.roles[0].name.lower() != "professional":
            return {"message": "Access denied. Professionals only."}

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
#   "closed_requests": [], closed_requests
#   "pending_requests": [],
#   "professional": {},
#   "user": {}}

class ServiceRequestAction(Resource):
    # method_decorators = [professional_required]
    @jwt_required()
    def post(self, user_id, request_id, action):
        user = User.query.get_or_404(user_id)        
        if user.roles[0].name.lower() != "professional":
            return {"message": "Access denied. Professionals only."}

        if action not in ["accept", "reject",'close']:
            return {"error": "Invalid action"}

        # Fetch the service request and check if it belongs to the current user
        service_request = ServiceRequest.query.filter_by(id=request_id, professional_id=user_id).first_or_404()
        # Assuming the service request has a 'professional_id' field
        if action == "accept":
            service_request.service_status = "accepted"
        elif action == "reject":
            service_request.service_status = "rejected"
        elif action == "close":
            if  service_request.service_status == "accepted":
                service_request.service_status = "closed"
                service_request.date_of_completion = datetime.now()
            else:
                return {"message": "Request is not approved yet."}
        
        db.session.commit()

        return {"message": f"Request {action}ed successfully"}
        
class ProfessionalSearch(Resource):
    @jwt_required()
    def get(self, user_id):
        search_type = request.args.get("search_type")
        search_value = request.args.get("value")

        # Validate user role
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "professional":
            return {"message": "Access denied. Professionals only."}

        # Base query: Filter by professional_id
        query = ServiceRequest.query.filter(ServiceRequest.professional_id == user_id)

        # Apply filters dynamically based on search_type
        if search_type == "date":
            try:
                # Convert the input date string to a datetime object
                search_date = datetime.strptime(search_value, "%Y-%m-%d")  # Expecting 'YYYY-MM-DD'
                # Create a range for the entire day
                start_of_day = search_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = start_of_day + timedelta(days=1) - timedelta(microseconds=1)
                # Filter requests within this day
                query = query.filter(ServiceRequest.date_of_request.between(start_of_day, end_of_day))
            except ValueError:
                return jsonify({"error": "Invalid date format. Use 'YYYY-MM-DD' (e.g., '2024-03-08')."})
        
        elif search_type == "address":
            query = query.join(ServiceRequest.customer).join(Customer.user).filter(
                User.address.ilike(f"%{search_value}%")
            )
        
        elif search_type == "pincode":
            query = query.join(ServiceRequest.customer).join(Customer.user).filter(
                User.pincode == search_value
            )
        
        else:
            return jsonify({"error": "Invalid search type. Valid options are 'date', 'address', or 'pincode'."})

        # Execute the query and fetch results
        results = query.options(joinedload(ServiceRequest.customer).joinedload(Customer.user)).all()

        # Handle empty results
        if not results:
            return jsonify({
                "status": "success",
                "message": "No service requests found",
                "data": []
            })

        # Return serialized data
        return jsonify({
            "status": "success",
            "message": f"{len(results)} service request(s) found.",
            "requests": [sr.to_dict() for sr in results]
        })

# {"requests": [{},{}..]}


class ProfessionalSummary(Resource):
    @jwt_required()
    # @cache.memoize(timeout=300)
    def get(self, user_id):

        logging.info(f"Fetching ProfessionalSummary for user_id: {user_id}")
        
        cache_key = f"professional_summary_{user_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logging.info(f"Cache HIT for {user_id}")
            return cached_data 
        logging.info(f"Cache MISS for {user_id}")

        professional = Professional.query.get(user_id)
        user = User.query.get(user_id)        
        if user.roles[0].name.lower() != "professional":
            return {"message": "Access denied. Professionals only."}

        uniq = user.fs_uniquifier
        if not professional:
            return jsonify({"error": "Professional not found"})

        # Get ratings
        ratings = db.session.query(ServiceRequest.rating).filter_by(professional_id=professional.id).all()

        rating_counts = [0] * 5  # 1 to 5 stars
        for rating in ratings:
            if rating[0] is not None:
                index = int(rating[0]) - 1  # Convert to integer
                if 0 <= index < 5:  # Ensure index is within valid range (0-4)
                    rating_counts[index] += 1

        valid_ratings = [rating[0] for rating in ratings if rating[0] is not None]  # Filter out None values
        average_rating = sum(valid_ratings) / len(valid_ratings) if valid_ratings else 0  # Avoid division by zero

        # Update ratings in DB
        professional.ratings = average_rating
        db.session.commit()

        # Get service request statuses
        statuses = db.session.query(ServiceRequest.service_status).filter_by(professional_id=professional.id).all()
        status_counts = {"pending": 0, "closed": 0, "rejected": 0, "accepted": 0}
        for status in statuses:
            if status[0] in status_counts:
                status_counts[status[0]] += 1

        response_data = {
            "pie_chart_prof": self.generate_pie_chart_prof(rating_counts, uniq),
            "bar_chart_prof": self.generate_bar_chart_prof({"pending": 2, "closed": 3, "rejected": 1, "accepted": 4}, uniq),
            "average_rating": average_rating,
        }
        cache.set(cache_key, response_data, timeout=300)

        return response_data
    
    @staticmethod
    @cache.memoize(timeout=300)  # Cache for 5 minutes
    def generate_pie_chart_prof(rating_counts, uniq):  
        """Generate a pie chart for professional ratings distribution."""
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

        # Save the chart locally
        chart_dir = os.path.join('static', 'charts')
        os.makedirs(chart_dir, exist_ok=True)

        chart_filename = f'pie_chart_prof_{uniq}.png'
        chart_path = os.path.join(chart_dir, chart_filename)

        fig.savefig(chart_path, format='png')

        return url_for('routes.serve_chart', filename=chart_filename, _external=True)

    @staticmethod
    @cache.memoize(timeout=300)  # Cache for 5 minutes
    def generate_bar_chart_prof(status_counts, uniq):
        """Generate a bar chart for service request status."""
        labels, values = zip(*status_counts.items())
        colors = ["#66B2FF", "#99FF99", "#FF9999"]

        fig, ax = plt.subplots()
        ax.bar(labels, values, color=colors)
        ax.set_xlabel("Status")
        ax.set_ylabel("Number of Requests")
        ax.set_title("Service Request Status")
        ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))  # Force integer y-axis labels

        # Save the chart locally
        chart_dir = os.path.join('static', 'charts')
        os.makedirs(chart_dir, exist_ok=True)

        chart_filename = f'bar_chart_prof_{uniq}.png'
        chart_path = os.path.join(chart_dir, chart_filename)

        fig.savefig(chart_path, format='png')

        return url_for('routes.serve_chart', filename=chart_filename, _external=True)

    @staticmethod
    def clear_cache(user_id):
        cache.delete_memoized(ProfessionalSummary.get, user_id)
        cache.delete_memoized(ProfessionalSummary.generate_pie_chart_prof, [], user_id)  # ✅ Corrected
        cache.delete_memoized(ProfessionalSummary.generate_bar_chart_prof, {}, user_id)  # ✅ Corrected

    # @staticmethod
    # def cleanup_old_charts():
    #     chart_dir = "static/charts"
    #     if not os.path.exists(chart_dir):
    #         return
        
    #     current_time = datetime.now()
    #     for filename in os.listdir(chart_dir):
    #         file_path = os.path.join(chart_dir, filename)
    #         file_modified = datetime.fromtimestamp(os.path.getmtime(file_path))
    #         if (current_time - file_modified).days > 1:
    #             os.remove(file_path)