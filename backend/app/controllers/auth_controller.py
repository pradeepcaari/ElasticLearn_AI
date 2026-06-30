from flask import jsonify, request
from flask_jwt_extended import create_access_token
from app.models.user import UserModel

def register_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'msg': 'Missing required fields'}), 400
    
    if UserModel.find_by_email(data['email']):
        return jsonify({'msg': 'User already exists'}), 400
    
    UserModel.create_user(data['username'], data['email'], data['password'])
    return jsonify({'msg': 'User registered successfully'}), 201

def login_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Missing email or password'}), 400
    
    user = UserModel.find_by_email(data['email'])
    if not user or not UserModel.check_password(user['password'], data['password']):
        return jsonify({'msg': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'access_token': access_token,
        'username': user['username'],
        'email': user['email']
    }), 200

def google_login_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('google_id'):
        return jsonify({'msg': 'Missing email or google_id'}), 400
    
    email = data['email']
    google_id = data['google_id']
    username = data.get('username') or email.split('@')[0]
    
    user = UserModel.find_by_email(email)
    if not user:
        # Create user with a dummy password
        import uuid
        dummy_password = str(uuid.uuid4())
        UserModel.create_user(username, email, dummy_password)
        user = UserModel.find_by_email(email)
        if user:
            UserModel.update_user_profile(user['_id'], {'google_id': google_id})
    else:
        if 'google_id' not in user:
            UserModel.update_user_profile(user['_id'], {'google_id': google_id})
            
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({
        'access_token': access_token,
        'username': user['username'],
        'email': user['email']
    }), 200

