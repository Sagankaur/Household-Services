from flask import current_app as app
from .model import *  # Import your models
from flask_security import SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password):
    return generate_password_hash(password,method='pbkdf2:sha256')

def create_initial_data():

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    # Create roles
    roles_data = [
        {"name": "Admin", "description": "Administrator with full access"},
        {"name": "Customer", "description": "Regular customer role"},
        {"name": "Professional", "description": "Professional service provider"}
    ]
    for role_data in roles_data:
        role = Role.query.filter_by(name=role_data["name"]).first()
        if not role:
            role = Role(name=role_data["name"], description=role_data["description"])
            db.session.add(role)
    db.session.commit()

    # Create a test service
    service = Service.query.filter_by(name="Test Service").first()
    if not service:
        service = Service(
            id=0,
            name="Test Service",
            price=0
        )
        db.session.add(service)
    db.session.commit()    

    #Get the roles
    admin_role = Role.query.filter_by(name="Admin").first()
    prof_role = Role.query.filter_by(name="Professional").first()
    cust_role = Role.query.filter_by(name="Customer").first()

    # Create or get Admin user
    admin_user = userdatastore.find_user(email="admin@study.iitm")
    if not admin_user:
        admin_user = userdatastore.create_user(
            email="admin@study.iitm",
            username="admin",
            name="admin",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="Admin Street",
            pincode="123456",
        )
        userdatastore.add_role_to_user(admin_user, admin_role)
    db.session.commit()

    # Create or get Professional user
    prof_user = userdatastore.find_user(username="prof")
    if not prof_user:
        prof_user = userdatastore.create_user(
            email="prof@study.iitm",
            username="prof",
            name="prof",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="123 Prof Street",
            pincode="123456",
        )
        userdatastore.add_role_to_user(prof_user, prof_role)
        prof_user.set_role('Professional') 
        # professional = Professional(id=prof_user.id, service_id=service.id) #Now it will work!
        # db.session.add(professional)
    # professional = Professional(id=prof_user.id, service_id=0)
    db.session.commit()

    # Create or get Customer user
    cust_user = userdatastore.find_user(username="cust")
    if not cust_user:
        cust_user = userdatastore.create_user(
            email="cust@study.iitm",
            username="cust",
            name="cust",
            password=hash_password("pass"),
            phone_number="0123456789",
            address="123 Cust Street",
            pincode="123456"
        )
        userdatastore.add_role_to_user(cust_user, cust_role)
        cust_user.set_role('Customer') 
    db.session.commit()

    # Fetch users

    cust_user = userdatastore.find_user(username="cust")
    prof_user = userdatastore.find_user(username="prof")
    # Create a service request only if it doesn't already exist
    service_request = ServiceRequest.query.filter_by(
        customer_id=cust_user.id,
        service_id=service.id,
        professional_id=prof_user.id
    ).first()
    if not service_request:
        service_request = ServiceRequest(
            customer_id=cust_user.id,
            service_id=service.id,
            professional_id=prof_user.id
        )
        db.session.add(service_request)

    db.session.commit()
