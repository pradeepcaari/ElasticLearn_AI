from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import Config

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app)
    jwt.init_app(app)

    # ── JWT error handlers ────────────────────────────────────────────────────
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'msg': 'Token has expired. Please log in again.', 'code': 'TOKEN_EXPIRED'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'msg': 'Invalid token. Please log in again.', 'code': 'TOKEN_INVALID'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'msg': 'Authorization token missing.', 'code': 'TOKEN_MISSING'}), 401

    # Register blueprints (routes)
    from app.routes.auth_routes import auth_bp
    from app.routes.diagnostic_routes import diagnostic_bp
    from app.routes.learning_routes import learning_bp
    from app.routes.job_routes import job_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(diagnostic_bp, url_prefix='/api/diagnostic')
    app.register_blueprint(learning_bp, url_prefix='/api/learning')
    app.register_blueprint(job_bp, url_prefix='/api/jobs')

    @app.route('/health')
    def health_check():
        return {'status': 'ok'}, 200

    return app
