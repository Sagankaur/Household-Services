from flask import Flask, redirect, url_for, request, flash, jsonify, session
from flask_login import login_user, login_required, current_user, LoginManager, UserMixin, login_user, login_required, logout_user
from flask import send_file
from flask_jwt_extended import create_access_token
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

        if role == 'Admin':
            return jsonify({"error": "Access Denied. Admins cannot log in here."}), 403

        if check_password_hash(user.password, password):
            token = user.generate_auth_token()   # Assume this method exists on your user model
            return jsonify({'token': token, 'userId': user.id, 'role': role}), 200
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

        def hash_password(password):
            return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)

        # Hash the password using Flask-Security
        hashed_password = hash_password(password)

        # Check if the username or email already exists
        if User.query.filter_by(username=username).first():
            return jsonify({"success": False, "message": "User with this username already exists."}), 400
        
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
            return jsonify([]), 200

        # Convert the services data to a list of dictionaries (make sure to adjust the fields)
        services_data = [{"id": service.id, "name": service.name, "description": service.description} for service in services]

        return jsonify(services_data), 200

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
            token = user.generate_auth_token()   # Assume this method exists on your user model
            return jsonify({'token': token, 'userId': user.id, 'role': role}), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print(f"Login error: {str(e)}")  # Log the error
        return jsonify({"error": "An unexpected error occurred"}), 500
