from flask import Flask, redirect, url_for, request, flash, jsonify, session
from flask_login import login_user, login_required, current_user, LoginManager, UserMixin, login_user, login_required, logout_user
from flask import send_file
from flask import Blueprint
from flask_security import verify_password, auth_required, current_user, SQLAlchemyUserDatastore
from flask_caching import Cache
from flask_cors import cross_origin, CORS
from flask_restful import Resource, Api
from flask_restful import reqparse


import os
import io
from io import BytesIO
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

from sqlalchemy import func
from sqlalchemy import or_
from sqlalchemy.orm import aliased
from sqlalchemy import cast, String

from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from werkzeug.security import generate_password_hash, check_password_hash

#from app import cache
from application.data.model import *
from flask import Blueprint, current_app

cache = Cache()
routes = Blueprint('routes', __name__)
api=Api(routes)

import jwt
from flask_jwt_extended import jwt_required, get_jwt_identity

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
def professional_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("Authorization header missing")
            return jsonify({'message': 'Authorization header is missing'}), 401
        
        token_parts = auth_header.split(' ')
        if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
            return jsonify({'message': 'Invalid Authorization header format'}), 401

        token = token_parts[1]
        
        user = verify_auth_token(token)
        
        if not user or not hasattr(user, 'roles'):
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        if not any(role.name.lower() == 'professional' for role in user.roles):
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
        
        if not user.roles or not any(role.name.lower() == 'customer' for role in user.roles):
            return jsonify({'message': 'Access denied. Customer role required.'}), 403
        
        return f(*args, **kwargs)
    return decorated_function


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
