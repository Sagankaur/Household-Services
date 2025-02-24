import os

# class Config:
#     SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
#     SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///housingdata.sqlite3')
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CACHE_TYPE = 'RedisCache'
    # CACHE_REDIS_URL = "redis://localhost:6379/0"
    # CACHE_DEFAULT_TIMEOUT = 300

#     MAIL_SERVER = os.getenv('MAIL_SERVER', 'localhost')
#     MAIL_PORT = os.getenv('MAIL_PORT', 1025)
#     MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', False)
#     MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', False)
#     MAIL_USERNAME = os.getenv('MAIL_USERNAME', None)
#     MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', None)

    # DEBUG = True
    # SECURITY_PASSWORD_HASH = 'bcrypt'
    # SECURITY_PASSWORD_SALT = 'thisshouldbekeptsecret'
    # SECRET_KEY = "shouldbekeyveryhidden"
    # SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    # SECURITY_TOKEN_MAX_AGE = 3600

    # WTF_CSRF_ENABLED = False

class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("FLASK_DATABASE_URI", "sqlite:///database.sqlite3")
    
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "defaultsecret")
    SECURITY_PASSWORD_SALT = os.getenv("FLASK_SECURITY_SALT", "defaultsalt")
    
    DEBUG = True

    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    SECURITY_TOKEN_MAX_AGE = 3600

    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 30
    CACHE_REDIS_PORT = 6379

    WTF_CSRF_ENABLED = False