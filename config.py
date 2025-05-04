class Config(object):
    DEBUG = False
    TESTING = False
    CACHE_TYPE ="RedisCache"
    CACHE_DEFAULE_TIMEOUT=300
    CELERY_BROKER_URL="redis://localhost:6379/1"
    CELERY_RESULT_BACKEND="redis://localhost:6379/2"
    CACHE_TYPE ="RedisCache"
    CACHE_REDIS_HOST="localhost"
    CACHE_REDIS_PORT=6379

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.sqlite3'
    SECRET_KEY = "thisissecter"
    SECURITY_PASSWORD_SALT = "thisissaltt"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    CACHE_REDIS_HOST='localhost'
    CACHE_REDIS_PORT=6379
    CACHE_REDIS_DB=3