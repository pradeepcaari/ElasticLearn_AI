from flask import Blueprint
from flask_jwt_extended import jwt_required

diagnostic_bp = Blueprint('diagnostic', __name__)

from app.controllers.diagnostic_controller import (
    get_questions, submit_diagnostic
)

diagnostic_bp.route('/questions', methods=['POST'])(jwt_required()(get_questions))
diagnostic_bp.route('/submit', methods=['POST'])(jwt_required()(submit_diagnostic))
