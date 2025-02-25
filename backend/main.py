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

app = None
api = None
celery = None
cache = None

def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    app.app_context().push()

    jwt = JWTManager(app)
    datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone="Asia/Kolkata",
        broker_connection_retry_on_startup=True
    )

    celery.Task=workers.ContextTask
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()

    return app, api, celery, cache


app, api,celery,cache= create_app()


def create_data():
    with app.app_context():
        db.create_all()
        import application.data.create_initial_data

CORS(app) 
from application.controllers.controllers import *
app.register_blueprint(routes)

from application.controllers.api import *
#api.add_resource(SectionAPI, '/api/section', '/api/section/<int:id>')
#api.add_resource(BookAPI, '/api/sectbook/<id>', '/api/book/<int:s_id>')


if __name__ == "__main__":
    create_data()
    app.run(debug=True)