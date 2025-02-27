from flask import Flask, redirect, url_for, request, flash, jsonify, session
from flask_login import login_user, login_required, current_user, LoginManager, UserMixin, login_user, login_required, logout_user
from flask import send_file
from flask import Blueprint
from flask_security import verify_password, auth_required, current_user, SQLAlchemyUserDatastore
from flask_caching import Cache
from flask_cors import cross_origin, CORS
from flask_restful import Resource, Api

import os
import io
from io import BytesIO

import matplotlib.pyplot as plt
from sqlalchemy import func
from datetime import datetime

from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from werkzeug.security import generate_password_hash, check_password_hash

#from app import cache
from application.data.model import *
from flask import Blueprint, current_app

cache = Cache()
routes = Blueprint('routes', __name__)
api=Api(routes)

import jwt
def verify_auth_token(token):
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(data['id'])
        if user and datetime.utcnow() < datetime.fromtimestamp(data['exp']):
            return user
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None
    return None

from functools import wraps
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        token = auth_header.split(' ')[1]  # Assuming 'Bearer <token>'
        user = verify_auth_token(token)
        
        if not user:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        if user.role != 'admin':
            return jsonify({'message': 'Access denied. Admin role required.'}), 403
        
        return f(*args, **kwargs)

    return decorated_function

def professional_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        token = auth_header.split(' ')[1]  # Assuming 'Bearer <token>'
        user = verify_auth_token(token)
        
        if not user:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        if user.role != 'professional':
            return jsonify({'message': 'Access denied. Professional role required.'}), 403
        
        return f(*args, **kwargs)

    return decorated_function

def customer_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        token = auth_header.split(' ')[1]  # Assuming 'Bearer <token>'
        user = verify_auth_token(token)
        
        if not user:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        if user.role != 'customer':
            return jsonify({'message': 'Access denied. Customer role required.'}), 403
        
        return f(*args, **kwargs)
    return decorated_function
# from main import db

# user_fields = {
#     'id': fields.Integer,
#     'username': fields.String,
#     'role': fields.String,
# }
# {
#     'id': fields.id,
#     'username': fields.username,
#     'name' : fields.name,
#     'email': fields.email,
#     'phone_number': fields.phone_number,
#     'address': fields.address,
#     'pincode': fields.pincode,
#     'roles' : [roles.name for roles in fields.roles]
#         }
# service_fields = {
#     'id': fields.Integer,
#     'name': fields.String,
#     'price': fields.Float,
#     'description': fields.String,
# }

# service_request_fields = {
#     'id': fields.Integer,
#     'service_id': fields.Integer,
#     'customer_id': fields.Integer,
#     'professional_id': fields.Integer,
#     'date_of_request': fields.String,
#     'status': fields.String,
#     'remarks': fields.String,
# }

class Admin(Resource):
    @auth_required('token')
    def get(self):
        return {"message": "Welcome, Admin!"}
        
    #@routes.route('/home_admin/<int:user_id>') #auth tocken required
    def home_admin(self,user_id=None):
        if 'user_id' not in session or session.get('role') != 'admin':
            return redirect(url_for('routes.login'))
        
        services = Service.query.all()
        pending_professionals = Professional.query.filter_by(service_status='pending').all()
        low_rated_professionals = Professional.query.filter(
            (Professional.average_rating < 2) & (func.count(Professional.ratings) > 3)
        ).all()
        pending_requests = ServiceRequest.query.filter_by(service_status='requested').all()
        
        return jsonify({
            'services':services,
            'pending_professionals':pending_professionals,
            'low_rated_professionals':low_rated_professionals,
            'pending_requests':pending_requests}
        )
    #C Service
    # @routes.route('/add_service', methods=['POST']) #done ny admin only
    @auth_required('token')
    def add_service():
        name = request.form['name']
        price = request.form['price']
        time_required = request.form['time_required']
        description = request.form['description']
        
        new_service = Service(name=name, price=price, time_required=time_required, description=description)
        db.session.add(new_service)
        db.session.commit()
        
        return redirect(url_for('routes.home_admin'))

    # @routes.route('/get_services', methods=['GET'])
    def get_services():
        try:
            # Query the services from your database (make sure to adjust for your actual model and data)
            services = Service.query.all()

            # If no services, return an empty list
            if not services:
                return jsonify([]), 200

            # Convert the services data to a list of dictionaries (make sure to adjust the fields)
            services_data = [{"id": service.id, "name": service.name, "description": service.description} for service in services]

            return jsonify(services_data), 200

        except Exception as e:
            # Handle any errors and return an appropriate response
            return jsonify({"error": str(e)}), 500

    # @routes.route('/update_service/<int:service_id>', methods=['PUT'])
    def update_service(service_id):
        data = request.json
        service = Service.query.get(service_id)
        if service:
            service.name = data['name']
            service.price = data['price']
            service.time_required = data['time_required']
            service.description = data['description']
            db.session.commit()
            return jsonify({'message': 'Service updated successfully'}), 200
        return jsonify({'error': 'Service not found'}), 404

    # admin can do Professional
    # @routes.route('/action_professional/<int:id>/<action>', methods=['POST'])
    def action_professional(id):
        professional = Professional.query.get(id)
        if professional:
            if action=="approve":
                professional.status = 'approved'

            if action=="reject":
                db.session.delete(professional)
    
            if action=="block":
                professional.status = 'blocked'        
        db.session.commit()
        return jsonify({'success': True})

    # @routes.route('/view_request/<int:id>', methods=['GET']) #VIEW Service Request
    def view_request(id):
        service_request = ServiceRequest.query.get(id)
        if not service_request:
            return jsonify({'message': 'No completed service request found'}), 404

        return jsonify({
            'customer_username': service_request.customer.user.username,
            'customer_name': service_request.customer.user.name,
            'c_address': service_request.customer.user.address,
            'c_pincode': service_request.customer.user.pincode,
            'c_phone': service_request.customer.user.phone_number,
            'professional_username': service_request.professional.user.username,
            'professional_name': service_request.professional.user.name,
            'p_address': service_request.customer.user.address,
            'p_phone': service_request.customer.user.phone_number,
            'service': service_request.service.name,
            'date_of_request': service_request.date_of_request.strftime('%Y-%m-%d'),
            'remarks': service_request.remarks,
            'date_of_completion': service_request.date_of_completion.strftime('%Y-%m-%d') if service_request.date_of_completion else None,
            'review': service_request.review,
            'rating': service_request.rating
        })

    @routes.route('/delete_request/<int:request_id>', methods=['DELETE'])
    def delete_request(request_id):
        service_request = ServiceRequest.query.get(request_id)
        if service_request:
            db.session.delete(service_request)
            db.session.commit()
            return jsonify({'message': 'Service request deleted successfully'}), 200
        return jsonify({'message': 'Service request not found'}), 404

    from sqlalchemy import or_

    # @routes.route('/search_admin/<int:user_id>', methods=['GET'])
    def search_admin(self):
        search_type = request.args.get('search_type')
        query = request.args.get('query')

        if search_type == "Professional":
            professionals = Professional.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%'),
                    Professional.ratings.ilike(f'%{query}%'),
                    Professional.status.ilike(f'%{query}%')
                )
            ).all()
            results = [prof.to_dict() for prof in professionals]

        elif search_type == "Customer":
            customers = Customer.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                )
            ).all()
            results = [cust.to_dict() for cust in customers]

        elif search_type == "Service":
            services = Service.query.filter(Service.name.ilike(f'%{query}%')).all()
            results = [service.to_dict() for service in services]

        elif search_type == "Service Request":
            service_requests = ServiceRequest.query.filter(
                or_(
                    ServiceRequest.service_status.ilike(f'%{query}%'),
                    ServiceRequest.customer_id.ilike(f'%{query}%'),
                    ServiceRequest.professional_id.ilike(f'%{query}%')
                )
            ).all()
            results = [req.to_dict() for req in service_requests]
        else:
            results = []

        return jsonify(results)

    @routes.route('/view_professional/<int:id>', methods=['GET'])
    def view_professional(id):
        professional = Professional.query.get(id)
        if professional:
            service_requests = ServiceRequest.query.filter_by(professional_id=professional.user_id).all()
            return jsonify({
                'professional': professional.to_dict(),
                'service_requests': [req.to_dict() for req in service_requests]
            })
        return jsonify({'error': 'Professional not found'}), 404

    @routes.route('/view_customer/<int:id>', methods=['GET'])
    def view_customer(id):
        customer = Customer.query.get(id)
        if customer:
            service_requests = ServiceRequest.query.filter_by(customer_id=customer.user_id).all()
            return jsonify({
                'customer': customer.to_dict(),
                'service_requests': [req.to_dict() for req in service_requests]
            })
        return jsonify({'error': 'Customer not found'}), 404

    @routes.route('/view_service/<int:id>', methods=['GET'])
    def view_service(id):
        service = Service.query.get(id)
        return jsonify(service.to_dict()) if service else jsonify({'error': 'Service not found'}), 404

    def delete_service_request(id):
        request = ServiceRequest.query.get(id)
        if request:
            db.session.delete(request)
            db.session.commit()
            return jsonify({'message': 'Service request deleted successfully'})
        return jsonify({'error': 'Service request not found'}), 404

    # @routes.route('/summary_admin/<int:user_id>')
    @cache.cached(key_prefix=lambda: f'summary_admin', timeout=3000)
    def summary_admin(self,user_id):
        if 'user_id' not in session or session.get('role') != 'admin':
            return redirect(url_for('routes.login'))

        # Calculate overall customer ratings (e.g., average rating)
        ratings_data = db.session.query(
            User.id, func.avg(User.rating).label('avg_rating')
        ).group_by(User.id).all()

        # Calculate service request summary (service type count)
        service_request_summary = db.session.query(
            ServiceRequest.status, func.count(ServiceRequest.id).label('count')
        ).group_by(ServiceRequest.status).all()

        # Data for Bar Graph (Customer Ratings)
        ratings = [data.avg_rating for data in ratings_data]
        users = [f'Customer {data.id}' for data in ratings_data]

        # Data for Pie Chart (Service Request Summary)
        request_status = [status[0] for status in service_request_summary]
        request_counts = [status[1] for status in service_request_summary]

        # Generate the charts
        bar_graph_path_admin = generate_bar_graph_admin(ratings, users)
        pie_chart_path_admin = generate_pie_chart_admin(request_status, request_counts)

        return jsonify({
            'bar_graph_path_admin': bar_graph_path_admin,
            'pie_chart_path_admin': pie_chart_path_admin
        })

    def generate_bar_graph_admin(ratings, users):
        # Create the bar graph
        fig, ax = plt.subplots()
        ax.bar(users, ratings, color='skyblue')
        ax.set_xlabel('Customer ID')
        ax.set_ylabel('Average Rating')
        ax.set_title('Customer Ratings Summary')
        ax.set_xticklabels(users, rotation=45, ha="right")

        # Save the plot to a temporary file
        graph_path = os.path.join('static', 'charts', f'bar_graph_admin{datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        os.makedirs(os.path.dirname(graph_path), exist_ok=True)
        fig.tight_layout()
        fig.savefig(graph_path)

        return graph_path

    def generate_pie_chart_admin(request_status, request_counts):
        # Create the pie chart
        fig, ax = plt.subplots()
        ax.pie(request_counts, labels=request_status, autopct='%1.1f%%', startangle=90, colors=['#FF6347', '#4CAF50', '#FFD700', '#1E90FF'])
        ax.set_title('Service Request Status')

        # Save the plot to a temporary file
        pie_chart_path = os.path.join('static', 'charts', f'pie_chart_admin{datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        os.makedirs(os.path.dirname(pie_chart_path), exist_ok=True)
        fig.savefig(pie_chart_path)

        return pie_chart_path

    @routes.route('/export_csv/<int:professional_id>', methods=['GET'])
    def trigger_csv_export(professional_id):
        export_closed_requests.delay(professional_id)
        return jsonify({'message': 'CSV export job started'}), 200

class Professional(Resource):
    @auth_required('token')
    def get(self):
        return {"message": "Welcome, Professional!"}
    
    
    # @routes.route('/home_professional/<int:user_id>')
    @professional_required
    def home_professional(self,user_id=None):
        professional_id=user_id
        if 'user_id' not in session or session.get('role') != 'professional':
            return redirect(url_for('routes.login'))

        user = User.query.get_or_404(user_id)
        professional = Professional.query.filter_by(id=user.id).first_or_404()

        professional_id = session['user_id']

        # Fetch pending service requests assigned to the professional
        pending_requests = ServiceRequest.query.filter_by(
            professional_id=professional_id, status='pending'
        ).order_by(ServiceRequest.date_of_request.desc()).all()

        accepted_requests = ServiceRequest.query.filter_by(
            professional_id=professional_id, status='accepted'
        ).order_by(ServiceRequest.date_of_request.desc()).all()

        # Fetch completed service requests for the professional
        completed_requests = ServiceRequest.query.filter_by(
            professional_id=professional_id, status='completed'
        ).order_by(ServiceRequest.date_of_request.desc()).all()

        if request.method == 'POST':
            # Update professional profile
            data = request.json
            user = User.query.get_or_404(user_id)
            professional = Professional.query.filter_by(id=user.id).first_or_404()

            # Update user fields
            user.username = data.get("username", user.username)
            user.email = data.get("email", user.email)
            user.phone_number = data.get("phone_number", user.phone_number)
            user.address = data.get("address", user.address)
            user.pincode = data.get("pincode", user.pincode)

            # Update professional-specific fields
            professional.service_id = data.get("service_id", professional.service_id)
            professional.experience = data.get("experience", professional.experience)
            professional.status = data.get("status", professional.status)
            professional.ratings = data.get("ratings", professional.ratings)
            professional.review = data.get("review", professional.review)

            db.session.commit()
            return jsonify({"message": "Professional profile updated successfully!"})

        user_prof= jsonify({
            "user": user.to_dict(),
            "professional": {
                "service_id": professional.service_id,
                "experience": professional.experience,
                "status": professional.status,
                "ratings": professional.ratings,
                "review": professional.review,
            }
        })

        return jsonify({
            'pending_requests':pending_requests,
            'completed_requests':completed_requests,
            'accepted_requests':accepted_requests,
            'user_prof':user_prof}
        )

    # Route to handle Accept/Reject actions for service requests
    # @routes.route('/service_request_action/<int:request_id>/<action>', methods=['POST'])
    def service_request_action(request_id, action):
        if 'user_id' not in session or session.get('role') != 'professional':
            return redirect(url_for('routes.login'))

        service_request = ServiceRequest.query.get(request_id)

        if service_request:
            if action == 'accept':
                service_request.service_status = 'accepted'
            elif action == 'reject':
                service_request.service_status = 'rejected'
            db.session.commit()

        return redirect(url_for('routes.home_professional'))

    @routes.route('/edit_profile_prof', methods=['GET', 'POST'])
    def edit_profile_prof():
        if 'user_id' not in session or session.get('role') != 'professional':
            return redirect(url_for('routes.login'))

        professional_id = session['user_id']
        professional = Professional.query.get(professional_id)

        if request.method == 'POST':
            # Fetch updated details from the form
            professional.username = request.form['username']
            professional.name = request.form['name']
            professional.email = request.form['email']
            professional.phone_number = request.form['phone_number']
            professional.address = request.form['address']
            professional.service_type = request.form['service_type']
            professional.experience = request.form['experience']

            try:
                db.session.commit()
                flash('Profile updated successfully!', 'success')
            except Exception as e:
                db.session.rollback()
                flash('Error updating profile: {}'.format(e), 'danger')

            return redirect(url_for('routes.home_professional'))

        return jsonify({ 'professional':professional})

    # @routes.route('/search_professional/<int:user_id>', methods=['GET'])
    def search_professional(self,user_id):
        search_type = request.args.get('search_type')
        query = request.args.get('query')

        if search_type == "Professional":
            # Search professionals by username, email, ratings, or status
            professionals = Professional.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%'),
                    Professional.ratings.ilike(f'%{query}%'),
                    Professional.status.ilike(f'%{query}%')
                )
            ).all()
            results = [prof.to_dict() for prof in professionals]

        elif search_type == "Customer":
            # Search customers by username or email
            customers = Customer.query.join(User).filter(
                or_(
                    User.username.ilike(f'%{query}%'),
                    User.email.ilike(f'%{query}%')
                )
            ).all()
            results = [cust.to_dict() for cust in customers]

        elif search_type == "Service":
            # Search services by service name
            services = Service.query.filter(Service.name.ilike(f'%{query}%')).all()
            results = [service.to_dict() for service in services]

        elif search_type == "Service Request":
            # Search service requests by service status, customer ID, or professional ID
            service_requests = ServiceRequest.query.filter(
                or_(
                    ServiceRequest.service_status.ilike(f'%{query}%'),
                    ServiceRequest.customer_id.ilike(f'%{query}%'),
                    ServiceRequest.professional_id.ilike(f'%{query}%')
                )
            ).all()
            results = [req.to_dict() for req in service_requests]
        else:
            results = []

        return jsonify({"requests": results})

    # @routes.route('/summary_professional/<int:user_id>')
    @cache.cached(key_prefix=lambda: f'summary_professional_{user_id}', timeout=500)
    def summary_professional(self,user_id):
        professional = Professional.query.get(user_id)    
        if professional:
            # Get ratings data
            ratings = db.session.query(ServiceRequest.ratings).filter_by(professional_id=professional.id).all()
            rating_counts = [0] * 5  # 1 to 5 stars
            for rating in ratings:
                rating_counts[rating[0] - 1] += 1
            
            if ratings:
                total_ratings = sum(rating[0] for rating in ratings)
                average_rating = total_ratings / len(ratings)
                
                professional.ratings = average_rating  # Assuming the `ratings` field exists in Professional model
                db.session.commit()
            else:
                average_rating = None

            # Get service request status data
            statuses = db.session.query(ServiceRequest.service_status).filter_by(professional_id=professional.id).all()
            status_counts = {"pending": 0, "completed": 0, "rejected": 0, "accepted": 0}
            for status in statuses:
                if status[0] in status_counts:
                    status_counts[status[0]] += 1

            # Generate charts
            pie_chart_prof = generate_pie_chart_prof(rating_counts)
            bar_chart_prof = generate_bar_chart_prof(status_counts)

            return jsonify({
                'pie_chart_prof': pie_chart_prof,
                'bar_chart_prof': bar_chart_prof,
                'average_rating': average_rating
            })
        else:
            return jsonify({"error": "Professional not found"}), 404

    def generate_pie_chart_prof(rating_counts):
        labels = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
        colors = ['#FF9999', '#FFCC99', '#FFFF99', '#99FF99', '#66B2FF']

        fig, ax = plt.subplots()
        ax.pie(rating_counts, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        ax.set_title('Ratings Distribution')

        # Save the plot to a temporary file
        pie_chart_path_prof = os.path.join('static', 'charts', f'pie_chart_prof{datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        os.makedirs(os.path.dirname(pie_chart_path_prof), exist_ok=True)
        fig.savefig(pie_chart_path_prof)

        return pie_chart_path_prof

    def generate_bar_chart_prof(status_counts):
        labels = list(status_counts.keys())
        values = list(status_counts.values())
        colors = ['#66B2FF', '#99FF99', '#FF9999']
        
        fig, ax = plt.subplots()
        ax.bar(labels, values, color=colors)
        ax.set_xlabel('Status')
        ax.set_ylabel('Number of Requests')
        ax.set_title('Service Request Status')
        ax.set_xticklabels(users, rotation=45, ha="right")

        graph_bar_path_prof = os.path.join('static', 'charts', f'bar_graph_prof{datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        os.makedirs(os.path.dirname(graph_bar_path_prof), exist_ok=True)
        fig.tight_layout()
        fig.savefig(graph_bar_path_prof)
        return graph_bar_path_prof

class Customer(Resource):
    # @auth_required('token')
    @customer_required
    def get(self):
        return {"message": "Welcome, Customer!"}
    
    @customer_required
    def home_customer(self, user_id=None): #get
        if request.method == 'POST':
        # Update customer profile logic
            data = request.json
            user = User.query.get_or_404(user_id)
            user.name = data.get("name", user.name)
            user.email = data.get("email", user.email)
            user.phone_number = data.get("phone", user.phone_number)
            user.username = data.get("username", user.username)
            user.pincode = data.get("pincode", user.pincode)
            user.address = data.get("address", user.address)
            
            db.session.commit()
            return jsonify({"message": "Profile updated successfully!"}), 200

        # For GET requests: Fetch customer details and service history
        user = User.query.get_or_404(user_id)
        service_requests = ServiceRequest.query.filter_by(customer_id=user_id).all()

        # Format service requests data
        service_data = [
            {
                'customer_username': request.customer.user.username,
                'customer_name': request.customer.user.name,
                'c_address': request.customer.user.address,
                'c_pincode': request.customer.user.pincode,
                'c_phone': request.customer.user.phone_number,
                'professional_username': request.professional.user.username,
                'professional_name': request.professional.user.name,
                'p_phone': request.professional.user.phone_number,
                'service': request.service.name,
                'date_of_request': request.date_of_request.strftime('%Y-%m-%d'),
                'remarks': request.remarks,
                "service_status": request.service_status,
                'date_of_completion': request.date_of_completion.strftime('%Y-%m-%d') if request.date_of_completion else None,
                'review': request.review,
                'ratings': request.ratings
            }
            for request in service_requests
        ]

        # Combine customer and service data
        response = {
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

        return jsonify(response), 200

    def close_request(request_id):
        # Get the service request by ID
        service_request = ServiceRequest.query.get_or_404(request_id)

        # Get rating and feedback from the request body
        rating = request.json.get('rating')
        feedback = request.json.get('feedback')

        if rating is None or feedback is None:
            return jsonify({"error": "Rating and feedback are required."}), 400

        # Update the service request with the rating and feedback
        service_request.status = 'closed'
        service_request.completion_date = datetime.now()
        service_request.rating = rating
        service_request.feedback = feedback

        # Save the updated service request
        db.session.commit()

        # Update professional's average rating
        professional = Professional.query.get(service_request.professional_id)
        if professional:
            total_reviews = professional.total_reviews + 1
            professional.ratings = ((professional.ratings * professional.total_reviews) + ratings) / total_reviews
            professional.total_reviews = total_reviews

        db.session.commit()
        cache.delete(f'summary_professional_{professional_id}')
        cache.delete(f'summary_admin')

        return jsonify({"message": "Service request closed and review submitted successfully."}), 200

    def search_customer(self):
        data = request.json
        service_name = data.get('service_name')
        pincode = data.get('pincode')
        rating = data.get('rating')
        address = data.get('address')

        query = Professional.query.filter_by(service_name=service_name)
        if pincode:
            query = query.filter_by(pincode=pincode)
        if rating:
            query = query.filter(Professional.rating >= float(rating))
        if address:
            query = query.filter(Professional.address.ilike(f"%{address}%"))

        professionals = query.all()
        results = [{
            'id': professional.id,
            'name': professional.user.name,
            'service_name': professional.service_name,
            'address': professional.user.address,
            'pincode': professional.pincode,
            'rating': professional.rating,
        } for professional in professionals]

        return jsonify({'professionals': results})


    # Route to book a service
    @routes.route('/book_service', methods=['POST'])
    def book_service():
        data = request.json
        professional_id = data.get('professional_id')
        service_id = data.get('service_id')
        remarks = data.get('remarks')
        user_id = request.user_id  # Extracted from token/session
        if not professional_id or not service_id:
            return jsonify({'error': 'Professional ID and Service ID are required.'}), 400

        service_request = ServiceRequest(
            customer_id=user_id,
            professional_id=professional_id,
            service_id=service_id,
            date_of_request=datetime.utcnow(),
            service_status='Pending',
            remarks = remarks
        )
        db.session.add(service_request)
        db.session.commit()

        cache.delete(f'summary_admin')
        cache.delete(f'summary_customer_{user_id}')
        cache.delete(f'summary_professiona_{professional_id}')

        return jsonify({"message": "Service successfully booked!"})

    # @routes.route('/summary_customer/<int:user_id>')
    @cache.cached(key_prefix=lambda: f'summary_customer_{user_id}', timeout=3000)
    def summary_customer(self,user_id):
        customer_id = session.get('user_id')
        
        # Fetch the service requests grouped by status
        status_counts = db.session.query(ServiceRequest.status, db.func.count(ServiceRequest.id))\
            .filter(ServiceRequest.customer_id == customer_id)\
            .group_by(ServiceRequest.status)\
            .all()
        
        # Prepare data for the chart
        labels = [status for status, count in status_counts]
        counts = [count for status, count in status_counts]
        
        # Generate the chart
        bar_graph_path_customer = generate_service_status_chart_cust(labels, counts)
        return jsonify({'bar_graph_path_customer': bar_graph_path_customer})
        

    def generate_service_status_chart_cust(labels, counts):
        fig, ax = plt.subplots()
        ax.bar(labels, counts, color=['#FF9999', '#66B2FF', '#99FF99'])
        ax.set_xlabel('Service Request Status')
        ax.set_ylabel('Count')
        ax.set_title('Service Requests by Status')
        ax.set_xticklabels(users, rotation=45, ha="right")
        
        img_io = BytesIO()
        fig.savefig(img_io, format='png')
        img_io.seek(0)
        
        # Create a unique file path to store the chart image
        chart_file_path = os.path.join('static', 'charts', f'bar_graph_customer_{datetime.now().strftime("%Y%m%d%H%M%S")}.png')
        os.makedirs(os.path.dirname(chart_file_path), exist_ok=True)
        
        # Save the image to the static directory
        with open(chart_file_path, 'wb') as f:
            f.write(img_io.getvalue())

        return chart_file_path

# api.add_resource(Admin, '/admin')
# api.add_resource(Admin, '/home_admin/<int:user_id>')
# api.add_resource(Admin, '/add_service')
# api.add_resource(Admin, '/get_services')
# api.add_resource(Admin, '/update_service/<int:service_id>')
# api.add_resource(Admin, '/action_professional/<int:id>/<action>')
# api.add_resource(Admin, '/view_request/<int:id>')
# api.add_resource(Admin, '/delete_request/<int:request_id>')
# api.add_resource(Admin, '/search_admin/<int:user_id>')
# api.add_resource(Admin, '/view_professional/<int:id>')
# api.add_resource(Admin, '/view_customer/<int:id>')
# api.add_resource(Admin, '/view_service/<int:id>')
# api.add_resource(Admin, '/summary_admin/<int:user_id>')
# api.add_resource(Admin, '/export_csv/<int:professional_id>')

# api.add_resource(Professional, '/professional')
# api.add_resource(Professional, '/home_professional/<int:user_id>')
# api.add_resource(Professional, '/service_request_action/<int:request_id>/<action>')
# api.add_resource(Professional, '/edit_profile_prof')
# api.add_resource(Professional, '/search_professional/<int:user_id>')
# api.add_resource(Professional, '/summary_professional/<int:user_id>')

# api.add_resource(Customer, '/customer')
# api.add_resource(Customer, '/home_customer/<int:user_id>')
# api.add_resource(Customer, '/close_request/<int:request_id>')
# api.add_resource(Customer, '/search_customer')
# api.add_resource(Customer, '/book_service')
# api.add_resource(Customer, '/summary_customer/<int:user_id>')
