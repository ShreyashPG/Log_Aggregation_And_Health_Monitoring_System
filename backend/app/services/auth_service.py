import bcrypt
from flask_jwt_extended import create_access_token
from app import mongo
from app.models import User

class AuthService:
    @staticmethod
    def create_user(username, email, password, role='viewer'):
        # Check if user exists
        existing_user = mongo.db.users.find_one({'$or': [{'username': username}, {'email': email}]})
        if existing_user:
            return None, "User already exists"
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create user
        user = User(username, email, password_hash, role)
        result = mongo.db.users.insert_one(user.to_dict())
        
        return str(result.inserted_id), None
    
    @staticmethod
    def authenticate_user(username, password):
        user = mongo.db.users.find_one({'username': username})
        if not user:
            return None, "User not found"
        
        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            access_token = create_access_token(identity=str(user['_id']))
            return {
                'access_token': access_token,
                'user': {
                    'id': str(user['_id']),
                    'username': user['username'],
                    'email': user['email'],
                    'role': user['role']
                }
            }, None
        
        return None, "Invalid credentials"
    
    @staticmethod
    def get_user_by_id(user_id):
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
            return user
        return None
