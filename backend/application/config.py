import os
from datetime import timedelta
basedir = os.path.abspath(os.path.dirname(__file__))

class Config():
    DEBUG = False
    
    SQLITE_DB_DIR = None
    SQLALCHEMY_DATABASE_URI = None
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    CELERY_BROKER_URL = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
    CACHE_REDIS_DB = 0

    CACHE_TYPE ="RedisCache"
    CACHE_REDIS_HOST="localhost"
    CACHE_REDIS_PORT=6379
    TIMEZONE="Asia/Kolkata"

    SMTP_SERVER = "localhost"
    SMTP_PORT = 1025
    SENDER_EMAIL = "sender@example.iitm"
    SENDER_PASSWORD = ""

    SECRET_KEY ='your-secret-key-here'
    SECURITY_URL_PREFIX = '/security'

class LocalDevelopmentConfig(Config):
    DEBUG = True

    SQLITE_DB_DIR = os.path.join(basedir, "../databases")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "database.sqlite3")
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    # JWT_TOKEN_LOCATION = 'cookies'
    # JWT_COOKIE_SECURE = False  # Set to True in production with HTTPS
    # JWT_COOKIE_CSRF_PROTECT = True
    
    SECRET_KEY =  "your-secret-key-here"
    SECURITY_PASSWORD_HASH = "bcrypt"
    SECURITY_PASSWORD_SALT = "your-secret-salt-here"
    
    SECURITY_REGISTERABLE = True
    SECURITY_CONFIRMABLE = False
    SECURITY_SEND_REGISTER_EMAIL = False
    SECURITY_USERNAME_ENABLE=True
    SECURITY_USERNAME_REQUIRED=True
    SESSION_COOKIE_SECURE=True
    SECURITY_UNAUTHORIZED_VIEW = None
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authorization'
    
    CACHE_TYPE ="RedisCache"
    CACHE_REDIS_HOST="localhost"
    CACHE_REDIS_PORT=6379
    TIMEZONE="Asia/Kolkata"