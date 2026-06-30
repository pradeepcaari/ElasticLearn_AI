from flask import Blueprint
from flask_jwt_extended import jwt_required

learning_bp = Blueprint('learning', __name__)

from app.controllers.learning_controller import learning_query, learning_help, get_chat_sessions, get_session_history

learning_bp.route('/query', methods=['POST'])(jwt_required()(learning_query))
learning_bp.route('/help', methods=['POST'])(jwt_required()(learning_help))
learning_bp.route('/sessions', methods=['GET'])(jwt_required()(get_chat_sessions))
learning_bp.route('/sessions/<session_id>', methods=['GET'])(jwt_required()(get_session_history))
