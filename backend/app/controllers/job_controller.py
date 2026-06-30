from flask import jsonify
from app.models.job_status import JobStatusModel

def get_job_status(job_id):
    job = JobStatusModel.get_job(job_id)
    if not job:
        return jsonify({'msg': 'Job not found'}), 404
    
    return jsonify({
        'job_id': str(job['_id']),
        'status': job['status'],
        'result': job.get('result'),
        'created_at': job['created_at'].isoformat() if 'created_at' in job else None
    }), 200
