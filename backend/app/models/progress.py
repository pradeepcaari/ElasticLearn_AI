from app.services.db_service import get_db
from bson.objectid import ObjectId
import datetime

class ProgressModel:
    collection = 'progress'

    @staticmethod
    def add_interaction(user_id, query, response, session_id=None, session_title=None):
        db = get_db()
        interaction = {
            'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id,
            'query': query,
            'response': response,
            'session_id': session_id,
            'session_title': session_title,
            'timestamp': datetime.datetime.now(datetime.UTC)
        }
        db[ProgressModel.collection].insert_one(interaction)

    @staticmethod
    def get_history(user_id, limit=5):
        db = get_db()
        cursor = db[ProgressModel.collection].find(
            {'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id}
        ).sort('timestamp', -1).limit(limit)
        return list(cursor)

    @staticmethod
    def get_sessions(user_id):
        db = get_db()
        pipeline = [
            {'$match': {'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id}},
            {'$sort': {'timestamp': 1}},
            {'$group': {
                '_id': '$session_id',
                'session_title': {'$first': '$session_title'},
                'timestamp': {'$last': '$timestamp'}
            }},
            {'$sort': {'timestamp': -1}}
        ]
        cursor = db[ProgressModel.collection].aggregate(pipeline)
        sessions = []
        for doc in cursor:
            sid = doc['_id']
            # If session_id is None, treat it as 'default'
            session_id_str = str(sid) if sid is not None else "default"
            sessions.append({
                'session_id': session_id_str,
                'session_title': doc.get('session_title') or "Default Conversation",
                'timestamp': doc.get('timestamp')
            })
        return sessions

    @staticmethod
    def get_session_messages(user_id, session_id):
        db = get_db()
        query = {'user_id': ObjectId(user_id) if isinstance(user_id, str) else user_id}
        if session_id == "default":
            query['session_id'] = {'$in': [None, "default"]}
        else:
            query['session_id'] = session_id
            
        cursor = db[ProgressModel.collection].find(query).sort('timestamp', 1)
        return list(cursor)
