# from app import db
from flask import current_app as app
from .model import *
from flask_security import SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash, check_password_hash

with app.app_context():
    def hash_password(password):
        return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)
    
    role = [
        {"name": "Admin", "description": "Administrator with full access"},
        {"name": "Customer", "description": "Regular customer role"},
        {"name": "Professional", "description": "Professional service provider"}
    ]
    for role_data in role:
        role = Role.query.filter_by(name=role_data["name"]).first()
        if not role:
            role = Role(name=role_data["name"], description=role_data["description"])
            db.session.add(role)

    service = Service.query.filter_by(id=0, name="Test Service").first()
    if not service:
        service = Service(
            id=0,
            name="Test Service",
            price=0
        )
        db.session.add(service)

    # admin_user = User.query.filter_by(username='admin_username').first()
    # if not admin_user:
    #     admin_user = User(
    #         username="admin_username",
    #         name="Admin User",
    #         email="admin@iitm.in",
    #         password=hash_password('pass'),
    #         phone_number="1234567890",
    #         address="123 Admin Street",
    #         pincode="123456",
    #         fs_uniquifier="admin_unique_string"  # Ensure uniqueness for your application
    #     )
    #     db.session.add(admin_user)


    # # Create users
    # if not userdatastore.find_user(id=0):
    #     userdatastore.create_user(
    #         id=0,
    #         username="admin",
    #         name="admin",
    #         email='admin@study.iitm',
    #         password=hash_password('pass'),
    #         role=[admin_role],  # Pass single Role instance
    #         phone_number='0123456789'
    #     )
    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    if not userdatastore.find_user(id=0):
        admin_user = userdatastore.create_user(
            id=0,
            username="admin",
            name="admin",
            email="admin@study.iitm",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="Admin Street",
            pincode="123456",
            role = "Admin"
        )
    else:
        admin_user = userdatastore.find_user(id=1)

    if not userdatastore.find_user(id=1):
        prof_user = userdatastore.create_user(
            id=2,
            username="prof",
            name="prof",
            email="prof@study.iitm",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="123 Prof Street",
            pincode="123456"
        )
    else:
        prof_user = userdatastore.find_user(id=2)

    # Create or get Customer user
    if not userdatastore.find_user(id=2):
        cust_user = userdatastore.create_user(
            id=3,
            username="cust",
            name="cust",
            email="cust@study.iitm",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="123 Cust Street",
            pincode="123456"
        )
    else:
        cust_user = userdatastore.find_user(id=3)

    admin_role = Role.query.filter_by(name="Admin").first()
    prof_role = Role.query.filter_by(name="Professional").first()
    cust_role = Role.query.filter_by(name="Customer").first()

    if admin_role and admin_user:
        existing_entry_admin = RolesUsers.query.filter_by(user_id=admin_user.id, role_id=admin_role.id).first()
        if not existing_entry_admin:
            db.session.add(RolesUsers(user_id=admin_user.id, role_id=admin_role.id))

    if cust_role and cust_user:
        existing_entry_cust = RolesUsers.query.filter_by(user_id=cust_user.id, role_id=cust_role.id).first()
        if not existing_entry_cust:
            db.session.add(RolesUsers(user_id=cust_user.id, role_id=cust_role.id))

    if prof_role and prof_user:
        existing_entry_prof = RolesUsers.query.filter_by(user_id=prof_user.id, role_id=prof_role.id).first()
        if not existing_entry_prof:
            db.session.add(RolesUsers(user_id=prof_user.id, role_id=prof_role.id))


    # Create a service request only if it doesn't already exist
    service_request = ServiceRequest.query.filter_by(id=0,
        customer_id=2, 
        service_id=0, 
        professional_id=1
        ).first()
    if not service_request:
        service_request = ServiceRequest(
            id=0,
            customer_id=2, 
            service_id=0, 
            professional_id=1
        )
        db.session.add(service_request)
    
    db.session.commit()

