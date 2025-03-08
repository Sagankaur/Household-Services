from application.controllers.api import *

# Admin Home
class AdminHome(Resource):
    @jwt_required()
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "admin":
            return {"message": "Access denied. Admin only."}

        services = [ser.to_dict() for ser in Service.query.all()]
        pending_professionals = [
            {**pp.user.to_dict(), **pp.to_dict()}  # Merge user and professional info
            for pp in Professional.query.filter_by(status='pending').all()
            ]
        # pending_professionals = Professional.query.filter_by(status='pending').all()
        low_rated_professionals = [
            {**lp.user.to_dict(), **lp.to_dict()}  # Merge user and professional details
            for lp in Professional.query.filter(
                (Professional.ratings < 2) & (Professional.total_reviews > 3)
            ).all()
        ]

        pending_requests = [sr.to_dict() for sr in ServiceRequest.query.filter_by(service_status='pending').all()]
        admin = User.query.filter_by(id=user_id).first()
        admin = admin.to_dict()
        return jsonify({
            'services': services,
            'pending_professionals': pending_professionals,
            'low_rated_professionals': low_rated_professionals,
            'pending_requests': pending_requests,
            'admin': admin
        })
# {"low_rated_professionals": [{},],"pending_professionals": [{},{}..],
# "pending_requests": [{},{}..],"services": [{},{}..]}

# Add Service
class AdminServiceAdd(Resource):
    def post(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Invalid JSON body"})

            name = data.get('name')
            price = float((data.get('price', 0) ) or 0) # Ensure valid conversion
            time_required = data.get('time_required', 0)
            description = data.get('description',None)

            if not name :
                return jsonify({"error": "Missing required fields"})

            new_service = Service(
                name=name, price=price, time_required=time_required, description=description
            )
            db.session.add(new_service)
            db.session.commit()

            return jsonify({"message": "Service added successfully"})

        except Exception as e:
            return jsonify({"error": str(e)})

# Update Service
class AdminServiceUpdate(Resource):
    def put(self, service_id):
        data = request.json
        service = Service.query.get(service_id)
        if service:
            service.name = data.get('name', service.name)
            service.price = float(data.get('price', service.price))  # Ensure proper conversion
            service.time_required = data.get('time_required', service.time_required)
            service.description = data.get('description', service.description)
            db.session.commit()
            return jsonify({'message': 'Service updated successfully'})
        return jsonify({'error': 'Service not found'})

# Get Services
# class AdminServiceGet(Resource):
#     def get(self):
#         services = Service.query.all()
#         services_data = [{"id": s.id, "name": s.name, "description": s.description} for s in services]
#         return jsonify(services_data), 200

# Action on Professional (approve, reject, block)
class ActionProf(Resource):
    def put(self, id, action):
        professional = Professional.query.get(id)
        if not professional:
            return jsonify({'error': 'Professional not found'})

        if action == "approve":
            professional.status = 'approved'
        elif action == "reject":
            db.session.delete(professional)
        elif action == "block":
            professional.status = "blocked"
        else:
            return jsonify({'error': 'Invalid action'})

        db.session.commit()
        return jsonify({'message': f'Action {action} performed on professional {id}'})

# View Service Request
class RequestView(Resource):
    def get(self, id):
        service_request = ServiceRequest.query.get(id)
        if not service_request:
            return jsonify({'message': 'Service request not found'}), 404
        
        return jsonify(service_request.to_dict())  # Ensure JSON response

# Delete Service Request
class AdminRequestDelete(Resource):
    def delete(self, request_id):
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({'message': 'Service request not found'})

        db.session.delete(service_request)
        db.session.commit()
        return jsonify({'message': 'Service request deleted successfully'})

class AdminSearch(Resource):
    @jwt_required()
    def get(self, user_id):  # Adding user_id parameter to match the endpoint
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "admin":
            return {"message": "Access denied. Admin only."}
        search_type = request.args.get('search_type')
        query = request.args.get('query')

        if search_type == "Professional":
            professionals = Professional.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%'),
                    cast(Professional.ratings, String).ilike(f'%{query}%'),
                    Professional.status.ilike(f'%{query}%')
                )
            ).all()
            results = [
                {**pp.user.to_dict(), **pp.to_dict()}
                for pp in professionals]
        elif search_type == "Customer":
            customers = Customer.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                )
            ).all()
            results = [cust.user.to_dict() for cust in customers]

        elif search_type == "Service":
            services = Service.query.filter(Service.name.ilike(f'%{query}%')).all()
            results = [service.to_dict() for service in services]

        elif search_type == "Service Request":
            service_requests = ServiceRequest.query.filter(
                or_(
                    ServiceRequest.service_status.ilike(f'%{query}%'),
                    cast(ServiceRequest.customer_id, String).ilike(f'%{query}%'),
                    cast(ServiceRequest.professional_id, String).ilike(f'%{query}%')
                )
            ).all()
            results = [req.to_dict() for req in service_requests]
        else:
            results = []

        return jsonify(results)


class AdminViewProfessional(Resource):
    def get(self, id):
        professional = Professional.query.get(id)
        if professional:
            service_requests = ServiceRequest.query.filter_by(professional_id=professional.id).all()
            return jsonify({
                'professional': {**professional.user.to_dict(), **professional.to_dict()},
                'service_requests': [req.to_dict() for req in service_requests]
            })
        return jsonify({'error': 'Professional not found'})
# {"professional": {},service_requests:[{},{}]}

class AdminViewCustomer(Resource):
    def get(self, id):
        customer = Customer.query.get(id)
        if customer:
            service_requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            return jsonify({
                'customer': customer.user.to_dict(),
                'service_requests': [req.to_dict() for req in service_requests]
            })
        return jsonify({'error': 'Customer not found'})
# {"customer": {},service_requests:[{},{}]}

class AdminSummary(Resource):
    @jwt_required()
    @cache.memoize(timeout=300)
    
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "admin":
            return {"message": "Access denied. Admin only."}
        uniq = user.fs_uniquifier

        ratings_data = db.session.query(
            Professional.id, func.avg(Professional.ratings).label('avg_rating')
        ).group_by(Professional.id).all()

        # Calculate service request summary (count by status)
        service_request_summary = db.session.query(
            ServiceRequest.service_status, func.count(ServiceRequest.id).label('count')
        ).group_by(ServiceRequest.service_status).all()

        # Data for Bar Graph (Customer Ratings)
        ratings = [data.avg_rating for data in ratings_data]
        users = [f'Professional {data.id}' for data in ratings_data]

        # Data for Pie Chart (Service Request Summary)
        request_status = [status[0] for status in service_request_summary]
        request_counts = [status[1] for status in service_request_summary]

        # Generate the charts
        bar_graph_path_admin = self.generate_bar_graph_admin(ratings, users,uniq)
        pie_chart_path_admin = self.generate_pie_chart_admin(request_status, request_counts,uniq)

        return jsonify({
            'bar_graph_path_admin': bar_graph_path_admin,
            'pie_chart_path_admin': pie_chart_path_admin
        })

    @staticmethod
    @cache.memoize(timeout=300)
    def generate_bar_graph_admin(ratings, users, uniq):
        ratings = [r if r is not None else 0 for r in ratings]

        fig, ax = plt.subplots()
        ax.bar(users, ratings, color='skyblue')
        ax.set_xlabel('Customer ID')
        ax.set_ylabel('Average Rating')
        ax.set_title('Customer Ratings Summary')
        ax.set_xticklabels(users, rotation=45, ha="right")

        graph_path = os.path.join('static', 'charts', f'bar_graph_admin_{uniq}.png')
        os.makedirs(os.path.dirname(graph_path), exist_ok=True)
        fig.tight_layout()
        fig.savefig(graph_path)
        return graph_path
    
    @staticmethod
    @cache.memoize(timeout=300)
    def generate_pie_chart_admin(request_status, request_counts, uniq):
        fig, ax = plt.subplots()
        ax.pie(request_counts, labels=request_status, autopct='%1.1f%%', startangle=90, colors=['#FF6347', '#4CAF50', '#FFD700', '#1E90FF'])
        ax.set_title('Service Request Status')

        pie_chart_path = os.path.join('static', 'charts', f'pie_chart_admin_{uniq}.png')
        os.makedirs(os.path.dirname(pie_chart_path), exist_ok=True)
        fig.savefig(pie_chart_path)
        return pie_chart_path

from application.jobs.tasks import export_closed_requests  # Import Celery task
class AdminCSV(Resource):
    def get(self, professional_id):
        # export_closed_requests.delay(professional_id)
        export_closed_requests.apply_async(args=[professional_id])  # Correct async call
        # export_closed_requests.apply_async((None, professional_id))

        return jsonify({'message': 'CSV export job started'})
