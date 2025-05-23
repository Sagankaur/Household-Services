from application.controllers.api import *
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import func

class AdminHome(Resource):
    @jwt_required()
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        if user.roles[0].name.lower() != "admin":
            return {"message": "Access denied. Admin only."}

        services = [ser.to_dict() for ser in Service.query.all()]
        pending_professionals = [
            {**pp.user.to_dict(), **pp.to_dict()}  
            for pp in Professional.query.filter_by(status='pending').all()
        ]
        pending_customers = [
            {**pc.user.to_dict(), **pc.to_dict()}  
            for pc in Customer.query.filter_by(status='pending').all()
        ]
        low_rated_professionals = [
            {**lp.user.to_dict(), **lp.to_dict()}  
            for lp in Professional.query.filter(
                (Professional.ratings < 2) & (Professional.total_reviews > 1) #to_rev>5
            ).all()
        ]
        low_rated_customers = [
            {**lc.user.to_dict(), **lc.to_dict()}  
            for lc in Customer.query
                .join(ServiceRequest)
                .filter(ServiceRequest.service_status == "pending") 
                .group_by(Customer.id)
                .having(func.count(ServiceRequest.id) > 1)  #make it 5
                .options(joinedload(Customer.user))  
                .all()
        ]
        pending_requests = [sr.to_dict() for sr in ServiceRequest.query.filter_by(service_status='pending').all()]
        blocked_professional = [
            {**bp.user.to_dict(), **bp.to_dict()}  
            for bp in Professional.query.filter_by(status='blocked').all()
        ]
        blocked_customer = [
            {**bc.user.to_dict(), **bc.to_dict()}  
            for bc in Customer.query.filter_by(status='blocked').all()
        ]
        admin = user.to_dict()

        return jsonify({
            'services': services,
            'pending_professionals': pending_professionals,
            'pending_customers': pending_customers,
            'low_rated_professionals': low_rated_professionals,
            'pending_requests': pending_requests,
            'low_rated_customers': low_rated_customers,
            'blocked_professional': blocked_professional,
            "blocked_customer":blocked_customer,
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

# View Service
class AdminViewService(Resource): 
    def get(self, id):
        service = Service.query.filter_by(id=id).first()
        if not service:
            return jsonify({"error": "Service not found"}), 404
        
        service_data = {
            "id": service.id,
            "name": service.name,
            "description": service.description
        }
        return jsonify(service_data)

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


# Action on Customer (approve, reject, block)
class ActionCust(Resource):
    def put(self, id, action):
        customer = Customer.query.get(id)
        if not customer:
            return jsonify({'error': 'Customer not found'})

        if action == "approve":
            customer.status = 'approved'
        elif action == "reject":
            db.session.delete(customer)
        elif action == "block":
            customer.status = "blocked"
        else:
            return jsonify({'error': 'Invalid action'})

        db.session.commit()
        return jsonify({'message': f'Action {action} performed on professional {id}'})

# View Service Request
class RequestView(Resource):
    def get(self, id):
        service_request = ServiceRequest.query.get(id)
        if not service_request:
            return jsonify({'message': 'Service request not found'})
        
        return jsonify(service_request.to_dict())  # Ensure JSON response
    
    def put(self, id):
        """ Update service request details """
        service_request = ServiceRequest.query.get(id)
        print(service_request.to_dict()) 
        # {'id': 2, 'customer_username': 'cust', 'customer_name': 'cust1', 'c_address': '123 Cust Street', 'c_pincode': '122222', 'c_phone': '5666690', 'professional_username': 'prof', 'professional_name': 'prof', 'p_phone': '0123456789', 'service': 'Test Service', 'date_of_request': '2025-03-04', 'remarks': None, 'service_status': 'accepted', 'date_of_completion': '2025-03-06', 'review': 'Great service!', 'rating': 4.5}
        if not service_request:
            return jsonify({'message': 'Service request not found'})
        if not request.json:
            return jsonify({"error": "Empty request body"})
        print(request.json)
        # {'c_address': '123 Cust new', 'c_pincode': '122222', 'c_phone': '5666690', 'date_of_request': '2025-03-27'}

        try:
            data = request.json
            if "c_address" in data: 
                service_request.customer.user.address = data["c_address"]
            if "c_pincode" in data:
                service_request.customer.user.pincode = data["c_pincode"]
            if "c_phone" in data:
                service_request.customer.user.phone_number = data["c_phone"]
            
            if "date_of_request" in data:
                # service_request.date_of_request = data["date_of_request"]
                service_request.date_of_request = datetime.strptime(data["date_of_request"], "%Y-%m-%d")
            if "review" in data:
                service_request.review = data["review"]
            if "rating" in data:
                service_request.rating = data["rating"]
            if "remarks" in data:
                service_request.remarks = data["remarks"]
                
            db.session.commit()
            professional = Professional.query.get(service_request.professional_id)
            
            if (professional) and (service_request.service_status=="closed") :
                if "rating" in data:
                    current_rating = data["rating"] 
                    total_reviews = professional.total_reviews
                    professional.ratings = ((current_rating * total_reviews) + current_rating) / total_reviews
                if "review" in data:
                    professional.update_ratings_and_reviews()
                db.session.commit()  # Save changes
            else:
                return ({'message': 'Can not Update service request',
                        "error": "Not allowed"})
            
            return jsonify({'message': 'Service request updated successfully', 
                            'request': service_request.to_dict()
                        })
        
        except Exception as e:
            db.session.rollback()  # Rollback in case of error
            return jsonify({'message': 'Failed to update request', 'error': str(e)})
    
# Delete Service Request
class AdminRequestDelete(Resource):
    def delete(self, request_id):
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return jsonify({'message': 'Service request not found'})

        db.session.delete(service_request)
        db.session.commit()
        return jsonify({'message': 'Service request deleted successfully'})

class AdminServiceDelete(Resource):
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return jsonify({'message': 'Service request not found'})

        professionals = Professional.query.filter_by(service_id=service_id).all()
        none_service = Service.query.filter_by(name="Test Service").first()
        none_service_id = none_service.id if none_service else 0  

        for professional in professionals:
            professional.service_id = none_service_id

        db.session.delete(service)
        db.session.commit()
        return jsonify({'message': 'Service deleted successfully'})

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
    def get(self, user_id):
        logging.info(f"Fetching AdminSummary for user_id: {user_id}")
        
        cache_key = f"admin_summary_{user_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logging.info(f"Cache HIT for {user_id}")
            return cached_data 
        logging.info(f"Cache MISS for {user_id}")

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
        users = [f'{data.id}' for data in ratings_data]

        # Data for Pie Chart (Service Request Summary)
        request_status = [status[0] for status in service_request_summary]
        request_counts = [status[1] for status in service_request_summary]

        # Generate the charts
        bar_graph_path_admin = self.generate_bar_graph_admin(ratings, users,uniq)
        pie_chart_path_admin = self.generate_pie_chart_admin(request_status, request_counts,uniq)

        response_data ={
            'bar_graph_path_admin': bar_graph_path_admin,
            'pie_chart_path_admin': pie_chart_path_admin
        }
        cache.set(cache_key, response_data, timeout=300) #5 minutes or 300 seconds
        return jsonify(response_data)

    @staticmethod
    @cache.memoize(timeout=300)
    def generate_bar_graph_admin(ratings, users, uniq):
        """Generate a bar chart for admin summary of customer ratings."""
        ratings = [float(r) if r is not None else 0 for r in ratings]

        fig, ax = plt.subplots()
        ax.bar(users, ratings, color='skyblue')
        ax.set_xlabel('Professional ID')
        ax.set_ylabel('Average Rating')
        ax.set_title('Ratings Summary')
        ax.set_xticklabels(users, rotation=45, ha="right")
        ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True))  # Ensure integer labels on y-axis

        # Save the chart locally
        chart_dir = os.path.join('static', 'charts')
        os.makedirs(chart_dir, exist_ok=True)

        chart_filename = f'bar_graph_admin_{uniq}.png'
        chart_path = os.path.join(chart_dir, chart_filename)

        fig.savefig(chart_path, format='png')

        return url_for('routes.serve_chart', filename=chart_filename, _external=True)

    
    @staticmethod
    @cache.memoize(timeout=300)
    def generate_pie_chart_admin(request_status, request_counts, uniq):
        request_counts = [int(c) if c is not None else 0 for c in request_counts]

        # Prevent empty pie chart error
        if sum(request_counts) == 0:
            request_counts[0] = 1  # Ensure at least one segment exists

        fig, ax = plt.subplots()
        ax.pie(request_counts, labels=request_status, autopct='%1.1f%%', startangle=90,
               colors=['#FF6347', '#4CAF50', '#FFD700', '#1E90FF'])
        ax.set_title('Service Request Status')

        # Save the chart locally
        chart_dir = os.path.join('static', 'charts')
        os.makedirs(chart_dir, exist_ok=True)

        chart_filename = f'pie_chart_admin_{uniq}.png'
        chart_path = os.path.join(chart_dir, chart_filename)

        fig.savefig(chart_path, format='png')

        return url_for('routes.serve_chart', filename=chart_filename, _external=True)

from application.jobs.tasks import export_closed_requests  # Import Celery task
from celery.exceptions import OperationalError

class AdminCSV(Resource):
    def get(self, professional_id):
        try:
            task = export_closed_requests.delay(professional_id)
            return jsonify({'message': 'CSV export job started', 'task_id': task.id})
        except OperationalError as e:
            return jsonify({'error': 'Celery operational error', 'details': str(e)})
        except Exception as e:
            return jsonify({'error': 'Unexpected error', 'details': str(e)})