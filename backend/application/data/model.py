from flask_sqlalchemy import SQLAlchemy
from flask_security import SQLAlchemyUserDatastore
from flask_security import UserMixin, RoleMixin, Security
from datetime import datetime

db = SQLAlchemy()

# Association table for roles and users
# class RolesUsers(db.Model): #one to one relationaship between role and user
#     __tablename__ = 'rolesusers'
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     role_id = db.Column(db.Integer, db.ForeignKey('role.id'))


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
    role = db.Column(db.String(15), default="Customer") #Customer, Professional, Admin
    # Roles relationship
    # roles = db.relationship('Role', secondary='rolesusers', backref=db.backref('user', lazy='dynamic'))#Customer, Professional, Admin
    # Relationships with Customer and Professional (One-to-One)
    customer = db.relationship('Customer', backref='user', uselist=False) #one to one relationaship between customer and user
    professional = db.relationship('Professional', backref='user', uselist=False) #one to one relationaship between professional and user

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
            "role" : self.role
            # 'roles' : [roles.name for roles in self.roles]
        }

    def set_role(self, role):
        self.role = role
        if role == "Customer" and not self.customer:
            self.customer = Customer(id=self.id)
        elif role == "Professional" and not self.professional:
            self.professional = Professional(id=self.id)
    @staticmethod
    def validate_user_role(user):
        if user.role == "Customer" and not user.customer:
            raise ValueError("User with role 'Customer' must have an associated Customer entry.")
        if user.role == "Professional" and not user.professional:
            raise ValueError("User with role 'Professional' must have an associated Professional entry.")
# class Role(db.Model, RoleMixin):
#     __tablename__ = 'role'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True) 
#     name = db.Column(db.String(80), unique=True, default="Customer")
#     description = db.Column(db.String(255))

#     def __repr__(self):
#         return f'<Role {self.name}>'


class Customer(db.Model):
    __tablename__ = 'customer'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True, unique=True) #if role is Customer than automatically update here
    service_requests = db.relationship('ServiceRequest', back_populates='customer') #1 customer=> many service reequests, one to many

    def __repr__(self):
        return f'<Customer {self.user.username}>'


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
    
    @property
    def all_ratings(self):
        # Collect all ratings given to the professional
        all_ratings = [request.ratings for request in self.service_requests if request.ratings is not None]
        return all_ratings

    def __repr__(self):
        return f'<Professional {self.user.username}, Service: {self.service.name}>'

class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    time_required = db.Column(db.Integer, nullable=True)

    professionals = db.relationship('Professional', backref='service_prof')  # One service, many professionals
    service_requests = db.relationship(
        'ServiceRequest',
        back_populates='service',
        overlaps="service"
    )

    def __repr__(self):
        return f'<Service {self.name}>'


class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=True)
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.String, nullable=True)
    service_status = db.Column(db.String(50), default='pending')  # pending/completed/accepted/rejected
    review = db.Column(db.String, nullable=True)  # connect to professional
    ratings = db.Column(db.Float, nullable=True)  # connect to professional => list of all the ratings

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
            'customer_username': self.customer.user.username,
            'customer_name': self.customer.user.name,
            'c_address': self.customer.user.address,
            'c_pincode': self.customer.user.pincode,
            'c_phone': self.customer.user.phone_number,
            'professional_username': self.professional.user.username if self.professional else None,
            'professional_name': self.professional.user.name if self.professional else None,
            'p_phone': self.professional.user.phone_number if self.professional else None,
            'service': self.service.name,
            'date_of_request': self.date_of_request.strftime('%Y-%m-%d'),
            'remarks': self.remarks,
            "service_status": self.service_status,
            'date_of_completion': self.date_of_completion.strftime('%Y-%m-%d') if self.date_of_completion else None,
            'review': self.review if self.date_of_completion else None,
            'ratings': self.ratings if self.date_of_completion else None

        }

datastore = SQLAlchemyUserDatastore(db, User, Role)