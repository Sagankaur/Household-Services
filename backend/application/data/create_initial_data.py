# # from app import db
# from flask import current_app as app
# from .model import *
# from flask_security import SQLAlchemyUserDatastore
# from werkzeug.security import generate_password_hash, check_password_hash

# with app.app_context():
#     def hash_password(password):
#         return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)
    
#     role = [
#         {"name": "Admin", "description": "Administrator with full access"},
#         {"name": "Customer", "description": "Regular customer role"},
#         {"name": "Professional", "description": "Professional service provider"}
#     ]
#     for role_data in role:
#         role = Role.query.filter_by(name=role_data["name"]).first()
#         if not role:
#             role = Role(name=role_data["name"], description=role_data["description"])
#             db.session.add(role)

#     service = Service.query.filter_by(id=0, name="Test Service").first()
#     if not service:
#         service = Service(
#             id=0,
#             name="Test Service",
#             price=0
#         )
#         db.session.add(service)

#     # admin_user = User.query.filter_by(username='admin_username').first()
#     # if not admin_user:
#     #     admin_user = User(
#     #         username="admin_username",
#     #         name="Admin User",
#     #         email="admin@iitm.in",
#     #         password=hash_password('pass'),
#     #         phone_number="1234567890",
#     #         address="123 Admin Street",
#     #         pincode="123456",
#     #         fs_uniquifier="admin_unique_string"  # Ensure uniqueness for your application
#     #     )
#     #     db.session.add(admin_user)


#     # # Create users
#     # if not userdatastore.find_user(id=0):
#     #     userdatastore.create_user(
#     #         id=0,
#     #         username="admin",
#     #         name="admin",
#     #         email='admin@study.iitm',
#     #         password=hash_password('pass'),
#     #         role=[admin_role],  # Pass single Role instance
#     #         phone_number='0123456789'
#     #     )
#     userdatastore: SQLAlchemyUserDatastore = app.security.datastore

#     if not userdatastore.find_user(id=0):
#         admin_user = userdatastore.create_user(
#             id=0,
#             username="admin",
#             name="admin",
#             email="admin@study.iitm",
#             password=hash_password("pass"),
#             phone_number="0123456789",
#             address="Admin Street",
#             pincode="123456",
#             role = "Admin"
#         )
#     else:
#         admin_user = userdatastore.find_user(id=1)

#     if not userdatastore.find_user(id=1):
#         prof_user = userdatastore.create_user(
#             id=2,
#             username="prof",
#             name="prof",
#             email="prof@study.iitm",
#             password=hash_password("pass"),
#             phone_number="0123456789",
#             address="123 Prof Street",
#             pincode="123456"
#         )
#     else:
#         prof_user = userdatastore.find_user(id=2)

#     # Create or get Customer user
#     if not userdatastore.find_user(id=2):
#         cust_user = userdatastore.create_user(
#             id=3,
#             username="cust",
#             name="cust",
#             email="cust@study.iitm",
#             password=hash_password("pass"),
#             phone_number="0123456789",
#             address="123 Cust Street",
#             pincode="123456"
#         )
#     else:
#         cust_user = userdatastore.find_user(id=3)

#     admin_role = Role.query.filter_by(name="Admin").first()
#     prof_role = Role.query.filter_by(name="Professional").first()
#     cust_role = Role.query.filter_by(name="Customer").first()

#     if admin_role and admin_user:
#         existing_entry_admin = RolesUsers.query.filter_by(user_id=admin_user.id, role_id=admin_role.id).first()
#         if not existing_entry_admin:
#             db.session.add(RolesUsers(user_id=admin_user.id, role_id=admin_role.id))

#     if cust_role and cust_user:
#         existing_entry_cust = RolesUsers.query.filter_by(user_id=cust_user.id, role_id=cust_role.id).first()
#         if not existing_entry_cust:
#             db.session.add(RolesUsers(user_id=cust_user.id, role_id=cust_role.id))

#     if prof_role and prof_user:
#         existing_entry_prof = RolesUsers.query.filter_by(user_id=prof_user.id, role_id=prof_role.id).first()
#         if not existing_entry_prof:
#             db.session.add(RolesUsers(user_id=prof_user.id, role_id=prof_role.id))


#     # Create a service request only if it doesn't already exist
#     service_request = ServiceRequest.query.filter_by(id=0,
#         customer_id=2, 
#         service_id=0, 
#         professional_id=1
#         ).first()
#     if not service_request:
#         service_request = ServiceRequest(
#             id=0,
#             customer_id=2, 
#             service_id=0, 
#             professional_id=1
#         )
#         db.session.add(service_request)
#     db.session.commit()


# from app import db  # Assuming 'db' is your SQLAlchemy instance
from flask import current_app as app
from .model import *  # Import your models
from flask_security import SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password):
    return generate_password_hash(password, method="pbkdf2:sha256", salt_length=8)

with app.app_context():

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
