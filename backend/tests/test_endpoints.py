import unittest
import json
from unittest.mock import MagicMock, patch
from bson.objectid import ObjectId

# ─── Mock Database Setup ──────────────────────────────────────────────────────
class MockCollection:
    def __init__(self):
        self.data = []
        
    def insert_one(self, doc):
        if '_id' not in doc:
            doc['_id'] = ObjectId()
        self.data.append(doc)
        class InsertResult:
            inserted_id = doc['_id']
        return InsertResult()
        
    def find_one(self, query):
        for doc in self.data:
            match = True
            for k, v in query.items():
                # Handle ObjectId comparison
                val = doc.get(k)
                if isinstance(val, ObjectId) and isinstance(v, str):
                    val = str(val)
                elif isinstance(val, str) and isinstance(v, ObjectId):
                    v = str(v)
                if val != v:
                    match = False
                    break
            if match:
                return doc
        return None
        
    def update_one(self, query, update):
        doc = self.find_one(query)
        if doc and '$set' in update:
            doc.update(update['$set'])
            
    def find(self, query):
        results = []
        for doc in self.data:
            match = True
            for k, v in query.items():
                val = doc.get(k)
                if isinstance(val, ObjectId) and isinstance(v, str):
                    val = str(val)
                elif isinstance(val, str) and isinstance(v, ObjectId):
                    v = str(v)
                if val != v:
                    match = False
                    break
            if match:
                results.append(doc)
                
        class MockCursor:
            def sort(self, key_or_list, direction=None):
                return self
            def limit(self, limit):
                return self
            def __iter__(self):
                return iter(results)
        return MockCursor()

# Pre-populate collections
mock_db_collections = {
    'users': MockCollection(),
    'jobs': MockCollection(),
    'progress': MockCollection()
}

def mock_get_db():
    return mock_db_collections

# Monkey patch get_db before importing app
import app.services.db_service
app.services.db_service.get_db = mock_get_db

# Now safe to import app
from app import create_app

class BackendTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        # Reset collections
        mock_db_collections['users'].data = []
        mock_db_collections['jobs'].data = []
        mock_db_collections['progress'].data = []
        
    def get_auth_headers(self, email="test@example.com", password="password123"):
        # Register
        self.client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': email,
            'password': password
        })
        # Login
        res = self.client.post('/api/auth/login', json={
            'email': email,
            'password': password
        })
        data = json.loads(res.data)
        return {
            'Authorization': f"Bearer {data['access_token']}"
        }

    def test_health_check(self):
        res = self.client.get('/health')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.data), {'status': 'ok'})

    def test_auth_flow(self):
        # Register
        res = self.client.post('/api/auth/register', json={
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 201)
        
        # Register duplicate
        res = self.client.post('/api/auth/register', json={
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 400)
        
        # Login success
        res = self.client.post('/api/auth/login', json={
            'email': 'alice@example.com',
            'password': 'password123'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('access_token', data)
        self.assertEqual(data['username'], 'alice')

    def test_google_auth_flow(self):
        # 1. New Google user registration/login
        res = self.client.post('/api/auth/google', json={
            'username': 'Google User',
            'email': 'google@example.com',
            'google_id': 'google-oauth2|123456789'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('access_token', data)
        self.assertEqual(data['username'], 'Google User')
        self.assertEqual(data['email'], 'google@example.com')

        # 2. Existing Google user login
        res = self.client.post('/api/auth/google', json={
            'username': 'Google User Updated',
            'email': 'google@example.com',
            'google_id': 'google-oauth2|123456789'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('access_token', data)
        self.assertEqual(data['username'], 'Google User')
        self.assertEqual(data['email'], 'google@example.com')

    def test_diagnostic_questions_fallback(self):
        headers = self.get_auth_headers()
        res = self.client.post('/api/diagnostic/questions', headers=headers, json={
            'interests': ['Calculus', 'Algorithms & DSA']
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('questions', data)
        self.assertTrue(len(data['questions']) > 0)
        # Verify question schema matches frontend
        q = data['questions'][0]
        self.assertIn('id', q)
        self.assertIn('type', q)
        self.assertIn('text', q)

    def test_diagnostic_submit_and_polling_fallback(self):
        headers = self.get_auth_headers()
        
        # Submit diagnostic answers
        res = self.client.post('/api/diagnostic/submit', headers=headers, json={
            'interests': ['Calculus'],
            'questions': [{'id': 1, 'type': 'mcq', 'text': 'Q1'}],
            'answers': [{'question_id': 1, 'type': 'mcq', 'selected_index': 1}]
        })
        self.assertEqual(res.status_code, 202)
        submit_data = json.loads(res.data)
        self.assertIn('job_id', submit_data)
        job_id = submit_data['job_id']
        
        # Poll job status (synchronously mock background processing completion)
        # Since it runs in a background thread, we wait a moment or check if the mock updated
        import time
        retries = 5
        completed = False
        while retries > 0:
            poll_res = self.client.get(f'/api/jobs/{job_id}', headers=headers)
            self.assertEqual(poll_res.status_code, 200)
            poll_data = json.loads(poll_res.data)
            if poll_data['status'] == 'COMPLETED':
                completed = True
                self.assertIn('result', poll_data)
                result = poll_data['result']
                self.assertIn('level', result)
                self.assertIn('gaps', result)
                self.assertIn('curriculum', result)
                break
            time.sleep(0.5)
            retries -= 1
            
        self.assertTrue(completed, "Diagnostic background job failed to complete in time.")

    def test_learning_help_fallback(self):
        headers = self.get_auth_headers()
        res = self.client.post('/api/learning/help', headers=headers, json={
            'topic': 'Derivative',
            'mode': 'foundation'
        })
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn('response', data)
        self.assertIn('first principles', data['response'].lower())

if __name__ == '__main__':
    unittest.main()
