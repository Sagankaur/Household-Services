from flask_sqlalchemy import SQLAlchemy
from flask_security import SQLAlchemyUserDatastore
from flask_security import UserMixin, RoleMixin, Security
from datetime import datetime, timedelta
from sqlalchemy import event
from sqlalchemy import Column, Float
import jwt
from flask import current_app

db = SQLAlchemy()

# Association table for roles and users
class RolesUsers(db.Model): #one to one relationaship between role and user
    __tablename__ = 'rolesusers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name= db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200))
    pincode = db.Column(db.String(10))
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean(), default=True)
    # role = db.Column(db.String(15), default="Customer") #Customer, Professional, Admin
    # Roles relationship
    roles = db.relationship('Role', secondary='rolesusers', backref=db.backref('user', lazy='dynamic'))#Customer, Professional, Admin
    # Relationships with Customer and Professional (One-to-One)
    customer = db.relationship('Customer', back_populates='user', uselist=False, cascade='all, delete-orphan') #one to one relationaship between customer and user
    professional = db.relationship('Professional', back_populates='user', uselist=False, cascade='all, delete-orphan') #one to one relationaship between professional and user

    def __repr__(self):
        return f'<User {self.username}, Role: {self.role}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name' : self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'address': self.address,
            'pincode': self.pincode,
            # "role" : self.role
            'roles' : [roles.name for roles in self.roles]
        }

    def set_role(self, role_name, **kwargs):
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            raise ValueError(f"Role '{role_name}' not found.")

        self.roles = [role]  # Replace existing roles with the new role

        if role_name == "Customer" and not self.customer:
            self.customer = Customer(id=self.id)
            db.session.add(self.customer)
        elif role_name == "Professional" and not self.professional:
            # Default values
            professional_data = {
                'id': self.id,
                'service_id': None,
                'experience': None,
                'status': 'pending',
                'ratings': None,
                'review': None,
                'total_reviews': 0
            }

            # Update with provided values
            professional_data.update(kwargs)

            # Validate service_id
            if professional_data['service_id'] is None:
                default_service = Service.query.first()
                if not default_service:
                    raise ValueError("No service available")
                professional_data['service_id'] = default_service.id
            else:
                service = Service.query.get(professional_data['service_id'])
                if not service:
                    raise ValueError(f"Service with id {professional_data['service_id']} not found.")

            # Create and add Professional instance
            self.professional = Professional(**professional_data)
            db.session.add(self.professional)

        db.session.add(self)
        db.session.commit()

    # def generate_auth_token(self, expires_in=3600):
    #     return jwt.encode(
    #         {'id': self.id, 'exp': datetime.utcnow() + timedelta(seconds=expires_in)},
    #         current_app.config['SECRET_KEY'],
    #         algorithm='HS256'
    #     )

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
    name = db.Column(db.String(80), unique=True, default="Customer")
    description = db.Column(db.String(255))

    def __repr__(self):
        return f'<Role {self.name}>'


class Customer(db.Model):
    __tablename__ = 'customer'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, unique=True) #if role is Customer than automatically update here
    service_requests = db.relationship('ServiceRequest', back_populates='customer') #1 customer=> many service reequests, one to many
    user = db.relationship('User', back_populates='customer')
    status = db.Column(db.String(10), default='pending')

    # user = db.relationship('User', back_populates='customer', uselist=False) #no need coz using backref

    def __repr__(self):
        return f'<Customer {self.user.username}>'
        
    def to_dict(self):
        return {
            "id": self.id,
            "status": self.status
            }


class Professional(db.Model):
    __tablename__ = 'professional'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, unique=True) #if role is Professional than automatically update here
    
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False) #one to one
    experience = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(100), default='pending') #approved/blocked
    
    ratings = db.Column(db.Float, nullable=True) #avg
    review = db.Column(db.String, nullable=True) 
    total_reviews = db.Column(db.Integer, default=0)

    # One-to-Many relationship with ServiceRequest
    service_requests = db.relationship('ServiceRequest', back_populates='professional') #ome professioanl=> many service requests
    service = db.relationship('Service', back_populates='professionals')  # ✅ Fix relationship
    user = db.relationship('User', back_populates='professional')

    @property
    def all_ratings(self):
        # Collect all ratings given to the professional
        return [
        sr.rating for sr in 
        ServiceRequest.query.filter_by(professional_id=self.id).filter(
        ServiceRequest.rating != None  # Exclude None ratings
        ).all()]
    
    def update_ratings_and_reviews(self):
        completed_requests = ServiceRequest.query.filter_by(professional_id=self.id, service_status='closed').filter(
            ServiceRequest.rating != None  # Exclude None ratings
        ).all()

        if completed_requests:
            total_rating = sum(sr.rating for sr in completed_requests)
            self.ratings = total_rating / len(completed_requests)
            self.total_reviews = len(completed_requests)

            recent_reviews = sorted(
                completed_requests,
                key=lambda x: x.date_of_completion or datetime.min,
                reverse=True
            )[:5]
            self.review = " | ".join(f"{sr.review[:100]}" for sr in recent_reviews if sr.review)
        else:
            self.ratings = 0.0
            self.total_reviews = 0
            self.review = None

        db.session.add(self)
        db.session.commit()
    def __repr__(self):
        return f'<Professional {self.user.username}, Service: {self.service.name}>'
    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "experience": self.experience,
            "status": self.status,
            "ratings": self.ratings,
            "review": self.review,
            "total_reviews": self.total_reviews,
            "service_name": self.service.name if self.service else None
        }

class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=True)

    professionals = db.relationship('Professional', back_populates='service')  # One service, many professionals
    service_requests = db.relationship(
        'ServiceRequest',
        back_populates='service',
        overlaps="service"
    )

    def __repr__(self):
        return f'<Service {self.name}>'
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "time_required": self.time_required
        }


class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.String, nullable=True)
    service_status = db.Column(db.String(50), default='pending')  # pending/closed/accepted/rejected
    review = db.Column(db.String, nullable=True)  # connect to professional
    rating = db.Column(db.Float, nullable=True)  # connect to professional => list of all the ratings
    #1 service re has 1 rating 
    # ratings = Column(Float)

    service = db.relationship(
        'Service',
        back_populates='service_requests',
        foreign_keys=[service_id],
        overlaps="service_requests"
    )
    customer = db.relationship(
        'Customer',
        back_populates='service_requests',
        foreign_keys=[customer_id],
        overlaps="service_requests"
    )
    professional = db.relationship(
        'Professional',
        back_populates='service_requests',
        foreign_keys=[professional_id],
        overlaps="service_requests"
    )
   
    def __repr__(self):
        return f'<ServiceRequest {self.id} - Customer: {self.customer.user.username}, Professional: {self.professional.user.username if self.professional else None}>'
    
    def to_dict(self):
        return {
            "id" : self.id,
            'customer_username': self.customer.user.username,
            'customer_name': self.customer.user.name,
            'c_address': self.customer.user.address,
            'c_pincode': self.customer.user.pincode,
            'c_phone': self.customer.user.phone_number,
            'professional_username': self.professional.user.username if self.professional else None,
            'professional_name': self.professional.user.name if self.professional else None,
            'p_phone': self.professional.user.phone_number if self.professional else None,
            'service': self.service.name if self.service else None,
            'date_of_request': self.date_of_request.strftime('%Y-%m-%d'),
            'remarks': self.remarks,
            "service_status": self.service_status ,
            'date_of_completion': self.date_of_completion.strftime('%Y-%m-%d') if self.date_of_completion else None,
            'review': self.review if self.date_of_completion else None,
            'rating': self.rating if self.date_of_completion else None

        }

    
# @event.listens_for(ServiceRequest.rating, 'set')
@event.listens_for(ServiceRequest.review, 'set')
def update_professional_ratings_and_reviews(target, value, oldvalue, initiator):
    if target.professional and (target.rating is not None or target.review):
        target.professional.update_ratings_and_reviews()

datastore = SQLAlchemyUserDatastore(db, User, Role)