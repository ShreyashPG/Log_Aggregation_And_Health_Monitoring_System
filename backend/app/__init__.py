from flask import Flask
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

mongo = PyMongo()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    mongo.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    from app.routes.auth import auth_bp
    from app.routes.logs import logs_bp
    from app.routes.metrics import metrics_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(logs_bp, url_prefix='/api/logs')
    app.register_blueprint(metrics_bp, url_prefix='/api/metrics')
    
    return app
