from flask import Blueprint
from flask_jwt_extended import jwt_required

job_bp = Blueprint('job', __name__)

from app.controllers.job_controller import get_job_status

job_bp.route('/<job_id>', methods=['GET'])(jwt_required()(get_job_status))
