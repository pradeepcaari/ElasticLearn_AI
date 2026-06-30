from werkzeug.security import generate_password_hash, check_password_hash
from app.services.db_service import get_db

class UserModel:
    collection = 'users'

    @staticmethod
    def create_user(username, email, password):
        db = get_db()
        hashed_password = generate_password_hash(password)
        user_data = {
            'username': username,
            'email': email,
            'password': hashed_password,
            'interests': [],
            'mode': 'foundation'
        }
        return db[UserModel.collection].insert_one(user_data)

    @staticmethod
    def find_by_email(email):
        db = get_db()
        return db[UserModel.collection].find_one({'email': email})

    @staticmethod
    def find_by_id(user_id):
        db = get_db()
        from bson.objectid import ObjectId
        return db[UserModel.collection].find_one({'_id': ObjectId(user_id) if isinstance(user_id, str) else user_id})

    @staticmethod
    def check_password(hashed_password, password):
        return check_password_hash(hashed_password, password)

    @staticmethod
    def update_user_profile(user_id, updates):
        db = get_db()
        from bson.objectid import ObjectId
        db[UserModel.collection].update_one(
            {'_id': ObjectId(user_id) if isinstance(user_id, str) else user_id},
            {'$set': updates}
        )
