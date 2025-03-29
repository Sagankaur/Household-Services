from flask import Flask, redirect, url_for, request, flash, jsonify, session
from flask_login import login_user, login_required, current_user, LoginManager, UserMixin, login_user, login_required, logout_user
from flask import send_file
from flask_jwt_extended import create_access_token, set_access_cookies
from flask import Blueprint
from flask_security import verify_password, auth_required, current_user, SQLAlchemyUserDatastore
from flask_caching import Cache
from flask_cors import cross_origin, CORS

import os
import io
from io import BytesIO
import jwt

import matplotlib.pyplot as plt
from sqlalchemy import func
from datetime import datetime

from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from werkzeug.security import generate_password_hash, check_password_hash

#from app import cache
from application.data.model import *
from application.data.create_initial_data import hash_password
from flask import Blueprint, current_app

# from application.database import db

routes = Blueprint('routes', __name__)

@routes.route('/login', methods=['GET', 'POST'])
def commonlogin():
    print("Login request received")
    if request.method == 'GET':
        return jsonify({"message": "This is a login API. Please send a POST request with JSON data."}), 400

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"})

        # Query the database for the user
        user = User.query.filter_by(username=username).first()
        password_check = check_password_hash(user.password, password) if user else False
        if not user or not password_check:
            return jsonify({"error": "Invalid username or password"})

        if not user:
            return jsonify({"error": "User not found"})
        
        # Debugging prints
        print(f"Check password result: {check_password_hash(user.password, password)}")

        if user.roles:
            role = user.roles[0].name  # Assuming a user has only one role
        else:
            role = "No Role Assigned"

        if role == 'Admin':
            return jsonify({"error": "Access Denied. Admins cannot log in here."}),403

        if role == 'Customer':
           if user.customer.status == "blocked":
                return jsonify({"error": f"Can't login right now. Customer {user.customer.status}"}),403
        
        if role == 'Professional':
            if user.professional.status!="approved":
                return jsonify({"error": f"Can't login right now. Professional {user.professional.status}"}),403

        if check_password_hash(user.password, password):
            # token = user.generate_auth_token()   # Assume this method exists on your user model
            token = create_access_token(identity=str(user.id))
            response = jsonify({'token': token, 'userId': user.id, 'role': role}) 
            # set_access_cookies(response, token)
            return response
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the error
        return jsonify({"error": "An unexpected error occurred"}), 500

@routes.route('/register', methods=['GET','POST'])
def commonregister():
    if request.method == 'POST':
        data = request.json
        name= data.get('name')
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        phone_number = data.get('phone_number')
        address = data.get('address')
        pincode = data.get('pincode')
        role_name = data.get('role')

        if User.query.filter_by(username=username).first():
            return jsonify({"success": False, "message": "User with this username already exists."}), 400
        if User.query.filter_by(email=email).first():  # Check email uniqueness
            return jsonify({"success": False, "message": "User with this email already exists."}), 400
        # def hash_password(password):
        #     return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)

        # Hash the password using Flask-Security
        hashed_password = hash_password(password)

    
        role = Role.query.filter_by(name=role_name).first()
        
        user = datastore.create_user(name=name,username=username, email=email, password=hashed_password,
                    phone_number=phone_number, address=address, pincode=pincode, roles=[role])

        db.session.add(user)
        db.session.flush()  # Get user ID before committing
        
        # Add role-specific data
        if role == 'Professional':
            service_type = data.get('service_type')
            experience = data.get('experience')
            service = Service.query.filter_by(name=service_type).first()
            professional = Professional(id=user.id, service_id=service.id, experience=experience)
            db.session.add(professional)
        elif role == 'Customer':
            customer = Customer(id=user.id)
            db.session.add(customer)

        db.session.commit()

        return jsonify({"success": True, "message": "Registration successful."}), 201
    else:
        return jsonify({"success": False, "message": "Invalid request method."}), 405


@routes.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('routes.login'))

@routes.route('/get_services', methods=['GET'])
def get_services():
    try:
        # Query the services from your database (make sure to adjust for your actual model and data)
        services = Service.query.all()

        # If no services, return an empty list
        if not services:
            return jsonify([])

        # Convert the services data to a list of dictionaries (make sure to adjust the fields)
        services_data = [service.to_dict() for service in services]

        return jsonify(services_data)

    except Exception as e:
        # Handle any errors and return an appropriate response
        return jsonify({"error": str(e)}), 500

@routes.route('/adminlogin', methods=['GET', 'POST'])
def adminlogin():
    print("Admin Login request received")
    if request.method == 'GET':
        return jsonify({"message": "This is a login API. Please send a POST request with JSON data."}), 400

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400

        # Query the database for the user
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Debugging prints
        print(f"Check password result: {check_password_hash(user.password, password)}")

        if user.roles:
            role = user.roles[0].name  # Assuming a user has only one role
        else:
            role = "No Role Assigned"

        if role != 'Admin':
            return jsonify({"error": "Access Denied. Only Admins can log in here."}), 403

        if check_password_hash(user.password, password):
            # token = user.generate_auth_token()   # Assume this method exists on your user model
            token = create_access_token(identity=str(user.id))
            return jsonify({'token': token, 'userId': user.id, 'role': role}), 200
        else:
            return jsonify({"error": "Invalid credentials"})

    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the error
        return jsonify({"error": "An unexpected error occurred"}), 500

import os
from pathlib import Path
from flask import send_from_directory

@routes.route('/static/charts/<filename>')
def serve_chart(filename):
    return send_from_directory('static/charts',filename)

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# app.config["DOWNLOAD_FOLDER"] = os.path.join(BASE_DIR, "application", "User_downloads")

@routes.route('/static/User_downloads/<filename>')
def download_csv(filename):
    return send_from_directory('static/User_downloads',filename, as_attachment=True)

# @routes.route('/downloads/<filename>')
# def download_file(filename):
#     return send_from_directory(app.config["DOWNLOAD_FOLDER"], filename, as_attachment=True)

# @routes.route('/downloads/<filename>')
# def download_file(filename):
#     return send_from_directory(os.path.join(BASE_DIR, "application", "jobs", "User_downloads"), filename)
