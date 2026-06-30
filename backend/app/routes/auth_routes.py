from flask import Blueprint

auth_bp = Blueprint('auth', __name__)

from app.controllers.auth_controller import (
    register_user, login_user, google_login_user
)

auth_bp.route('/register', methods=['POST'])(register_user)
auth_bp.route('/login', methods=['POST'])(login_user)
auth_bp.route('/google', methods=['POST'])(google_login_user)
