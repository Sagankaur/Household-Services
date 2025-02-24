import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
#from flask_caching import Cache
#from flask_migrate import Migrate
from flask_login import LoginManager
from flask_security import Security, SQLAlchemyUserDatastore, auth_required

from dotenv import load_dotenv

from redis import Redis

from celery import Celery

from application.database import migrate, db
from application.models import * #has datastore
from application.auth import *

from application.celery.scheduler import register_periodic_tasks
from application.celery.celery_factory import celery_init_app
from application.routes import cache

#import application.routes
load_dotenv()

#login_manager = LoginManager()
#cache = Cache()

def create_app():
    app = Flask(__name__, template_folder='templates', static_folder='static')
    print("Template folder:", os.path.join(os.getcwd(), 'templates'))

    # Load configurations from config.py
    app.config.from_object('config.LocalDevelopmentConfig')
    app.config['REDIS_URL'] = os.getenv('REDIS_URL', 'redis://127.0.0.1:6379')
    app.config['CELERY_BROKER_URL'] = os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0')
    #celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])

    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_URL'] = "redis://localhost:6379/0"
    app.config['CACHE_DEFAULT_TIMEOUT'] = 300

    #datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    
    cache.init_app(app)
    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app)
    CORS(app,supports_credentials=True,resources={r"/*": {"origins": "*"}})

    redis_client = Redis.from_url(app.config['REDIS_URL'])
    celery_app = celery_init_app(app)
    register_periodic_tasks(celery_app)
    #login_manager.login_view = 'auth.login' 

    
    # Register blueprints
    from application import routes
    app.register_blueprint(routes.routes)
    return app

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        
        db.create_all()
        print('db created')
        import application.create_initial_data

    print("working app")
    app.run(debug=True)