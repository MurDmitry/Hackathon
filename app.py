from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import traceback
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    init_db, get_or_create_user, create_idea, get_user_ideas, 
    get_pending_ideas, update_idea_status, get_top_users, get_user_by_telegram_id
)

app = Flask(__name__)
CORS(app)

# Инициализация БД при запуске
init_db()

# Модераторы
MODERATORS = [111111111]

@app.route('/')
def serve_index():
    return send_from_directory('mini-app', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('mini-app', path)

# API endpoints
@app.route('/api/auth', methods=['POST'])
def auth():
    try:
        user_data = request.json
        user = get_or_create_user(
            user_data['id'], 
            user_data['first_name'], 
            user_data.get('username', '')
        )
        
        return jsonify({
            'id': user['telegram_id'],
            'first_name': user['first_name'],
            'username': user['username'],
            'is_moderator': bool(user['is_moderator'])
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/ideas', methods=['POST'])
def create_idea_api():
    try:
        data = request.json
        print(f"Получена новая идея от пользователя {data['user_id']}")
        
        user = get_user_by_telegram_id(data['user_id'])
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        idea_id = create_idea(
            user['id'],
            data['description'],
            data.get('justification', ''),
            data.get('evidence_link', ''),
            data.get('is_anonymous', False)
        )
        
        return jsonify({'id': idea_id, 'status': 'success'})
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500

@app.route('/api/users/<int:telegram_id>/ideas')
def get_user_ideas_api(telegram_id):
    try:
        ideas = get_user_ideas(telegram_id)
        
        ideas_list = []
        for idea in ideas:
            ideas_list.append({
                'id': idea['id'],
                'description': idea['description'],
                'justification': idea['justification'],
                'evidence_link': idea['evidence_link'],
                'is_anonymous': bool(idea['is_anonymous']),
                'status': idea['status'],
                'saved_amount': idea['saved_amount'],
                'moderator_comment': idea['moderator_comment'],
                'created_at': idea['created_at'],
                'approved_at': idea['approved_at']
            })
        
        return jsonify(ideas_list)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/pending-ideas')
def get_pending_ideas_api():
    try:
        ideas = get_pending_ideas()
        
        ideas_list = []
        for idea in ideas:
            ideas_list.append({
                'id': idea['id'],
                'description': idea['description'],
                'justification': idea['justification'],
                'evidence_link': idea['evidence_link'],
                'is_anonymous': bool(idea['is_anonymous']),
                'author_name': idea['first_name'],
                'author_username': idea['username'],
                'created_at': idea['created_at']
            })
        
        return jsonify(ideas_list)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/rating/top-users')
def get_top_users_api():
    try:
        users = get_top_users()
        
        users_list = []
        for user in users:
            users_list.append({
                'first_name': user['first_name'],
                'approved_ideas': user['approved_ideas']
            })
        
        return jsonify(users_list)
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)