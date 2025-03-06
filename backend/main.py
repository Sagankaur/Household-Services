import os
from flask import Flask
from flask_restful import Api
from flask_security import Security, SQLAlchemySessionUserDatastore

from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from flask_caching import Cache
from flask_cors import CORS

from application.config import LocalDevelopmentConfig
from application.data.model import *

from application.jobs import workers
from application.jobs import tasks

from application.controllers.customer_api import *
from application.controllers.professional_api import *
from application.controllers.admin_api import *

app = None
api = None
celery = None
cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}}, 
        supports_credentials=True, 
        allow_headers=["Content-Type", "Authorization"], 
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)

    with app.app_context():
    # app.app_context().push()
        api = Api(app)
 
        api.add_resource(AdminHome, '/home_admin/<int:user_id>')
        api.add_resource(AdminServiceAdd, '/add_service')
        api.add_resource(AdminServiceUpdate, '/update_service/<int:service_id>')
        # api.add_resource(AdminServiceGet, '/get_services')
        api.add_resource(ActionProf, '/action_professional/<int:id>/<action>')
        api.add_resource(AdminRequestView, '/view_request/<int:id>') #home_prof
        api.add_resource(AdminRequestDelete, '/delete_request/<int:request_id>')
        api.add_resource(AdminSearch, '/search_admin/<int:user_id>')
        api.add_resource(AdminViewProfessional, '/view_professional/<int:id>')
        api.add_resource(AdminViewCustomer, '/view_customer/<int:id>')
        # api.add_resource(AdminViewService, '/view_service/<int:id>')
        api.add_resource(AdminSummary, '/summary_admin/<int:user_id>')
        api.add_resource(AdminCSV, '/export_csv/<int:professional_id>')

        api.add_resource(ProfessionalHome, "/home_professional/<int:user_id>",methods=["GET", "PUT"])
        # api.add_resource(ProfessionalProfile, "/edit_profile_prof")
        api.add_resource(ServiceRequestAction, "/service_request_action/<int:user_id>/<int:request_id>/<string:action>") 
        api.add_resource(ProfessionalSearch, "/search_professional/<int:user_id>")
        api.add_resource(ProfessionalSummary, "/summary_professional/<int:user_id>")

        # Customer Routes
        api.add_resource(CustomerHome, "/home_customer/<int:user_id>", methods=["GET", "PUT"])
        api.add_resource(CustomerSearch, "/search_customer/<int:user_id>", methods=["POST"])  
        api.add_resource(CustomerSummary, "/summary_customer/<int:user_id>", methods=["GET"])
        api.add_resource(ServiceBooking, "/book_service/<int:user_id>", methods=["POST"])  
        api.add_resource(ServiceClosure, "/close_request/<int:user_id>/<int:request_id>", methods=["PUT"])


        # print("Routes added:", api.app.url_map)

    # app.app_context().push()
        jwt = JWTManager(app)
        datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
        app.security = Security(app, datastore)
    # app.app_context().push()
    
        celery=workers.celery
        celery.conf.update(
            broker_url = app.config["CELERY_BROKER_URL"],
            result_backend = app.config["CELERY_RESULT_BACKEND"],
            timezone="Asia/Kolkata",
            broker_connection_retry_on_startup=True
        )

        celery.Task=workers.ContextTask
    # app.app_context().push()
        cache=Cache(app)
    # app.app_context().push()

    return app, api, celery, cache


app, api,celery,cache= create_app()
with app.app_context():
    for rule in app.url_map.iter_rules():
        print(rule)


def create_data():
    with app.app_context():
        db.create_all()
        from application.data.create_initial_data import create_initial_data
        create_initial_data()

# CORS(app) 
# CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})
from application.controllers.controllers import *
app.register_blueprint(routes)

if __name__ == "__main__":
    create_data()
    # user = User.query.filter_by(username="cust").first()
    # print(user.password)  # Verify stored hash
    # print(check_password_hash(user.password, "pass"))  # Should be True if correct

    app.run(debug=True)
