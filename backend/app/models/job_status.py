from app.services.db_service import get_db
from bson.objectid import ObjectId
import datetime

class JobStatusModel:
    collection = 'jobs'

    @staticmethod
    def create_job(user_id):
        db = get_db()
        job_data = {
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
            'status': 'PENDING',
            'result': None,
            'created_at': datetime.datetime.now(datetime.UTC),
            'updated_at': datetime.datetime.now(datetime.UTC)
        }
        result = db[JobStatusModel.collection].insert_one(job_data)
        return str(result.inserted_id)

    @staticmethod
    def update_job(job_id, status, result=None):
        db = get_db()
        update_data = {
            'status': status,
            'updated_at': datetime.datetime.now(datetime.UTC)
        }
        if result is not None:
            update_data['result'] = result
            
        db[JobStatusModel.collection].update_one(
            {'_id': ObjectId(job_id)},
            {'$set': update_data}
        )

    @staticmethod
    def get_job(job_id):
        db = get_db()
        return db[JobStatusModel.collection].find_one({'_id': ObjectId(job_id)})
