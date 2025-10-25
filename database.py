import sqlite3
import os
from datetime import datetime

def init_db():
    """Инициализация базы данных"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Пользователи
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE,
            first_name TEXT,
            username TEXT,
            is_moderator BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Идеи
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ideas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            description TEXT NOT NULL,
            justification TEXT,
            evidence_link TEXT,
            is_anonymous BOOLEAN DEFAULT FALSE,
            status TEXT DEFAULT 'pending',
            saved_amount INTEGER,
            moderator_comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Лайки
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            idea_id INTEGER,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(idea_id, user_id),
            FOREIGN KEY (idea_id) REFERENCES ideas (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Проверим что таблицы создались
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    
    # Добавляем тестовые данные если таблицы пустые
    cursor.execute('SELECT COUNT(*) FROM ideas')
    ideas_count = cursor.fetchone()[0]
    
    if ideas_count == 0:
        add_test_data(cursor)
    
    conn.commit()
    conn.close()

def add_test_data(cursor):
    """Добавление тестовых данных"""
    # Добавляем тестовых пользователей
    test_users = [
        (111111111, 'Арсений Моисеев', 'arseny_m', True),
        (222222222, 'Дмитрий Мурзаев', 'dmitry_m', False),
        (333333333, 'Поликарпова Таисия', 'taisiya_p', False),
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (telegram_id, first_name, username, is_moderator)
        VALUES (?, ?, ?, ?)
    ''', test_users)
    
    # Получаем ID пользователей
    user_ids = {}
    for telegram_id, first_name, username, is_moderator in test_users:
        cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (telegram_id,))
        result = cursor.fetchone()
        if result:
            user_ids[telegram_id] = result[0]
    
    # Добавляем тестовые идеи
    test_ideas = [
        # Одобренные идеи
        (user_ids[111111111], 'Оптимизация маршрутов доставки', 
         'Снижение пробега на 15% и времени доставки на 20%', '', False, 'approved', 50000, 
         'Отличная идея! Реализуем в следующем квартале', '2024-01-15', '2024-01-20'),
        
        # Идеи на модерации (status = 'pending')
        (user_ids[222222222], 'Внедрение системы автоматического учета топлива', 
         'Снижение расхода топлива на 8% и исключение человеческого фактора', '', False, 'pending', 
         None, None, '2024-01-16', None),
        
        (user_ids[333333333], 'Система мотивации для водителей', 
         'Повышение лояльности и снижение текучки кадров', '', True, 'pending', 
         None, None, '2024-01-17', None),
    ]
    
    print("💡 Добавляем идеи...")
    cursor.executemany('''
        INSERT INTO ideas (user_id, description, justification, evidence_link, is_anonymous, 
                          status, saved_amount, moderator_comment, created_at, approved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', test_ideas)
    

def get_db_connection():
    """Создание подключения к базе данных"""
    conn = sqlite3.connect('ideas.db')
    conn.row_factory = sqlite3.Row
    return conn

# Функции для работы с пользователями
def get_or_create_user(telegram_id, first_name, username):
    """Получить или создать пользователя"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT OR IGNORE INTO users (telegram_id, first_name, username)
        VALUES (?, ?, ?)
    ''', (telegram_id, first_name, username))
    
    cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
    user = cursor.fetchone()
    
    conn.commit()
    conn.close()
    return user

def get_user_by_telegram_id(telegram_id):
    """Получить пользователя по telegram_id"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
    user = cursor.fetchone()
    
    conn.close()
    return user


def create_idea(user_id, description, justification, evidence_link, is_anonymous):
    """Создать новую идею"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id FROM ideas 
        WHERE user_id = ? AND description = ? AND status = 'pending'
    ''', (user_id, description))
    
    existing_idea = cursor.fetchone()
    if existing_idea:
        conn.close()
        return existing_idea['id']
    
    cursor.execute('''
        INSERT INTO ideas (user_id, description, justification, evidence_link, is_anonymous)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, description, justification, evidence_link, is_anonymous))
    
    idea_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return idea_id


def get_user_ideas(telegram_id):
    """Получить идеи пользователя"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT i.*, u.first_name, u.username 
        FROM ideas i 
        JOIN users u ON i.user_id = u.id 
        WHERE u.telegram_id = ?
        ORDER BY i.created_at DESC
    ''', (telegram_id,))
    
    ideas = cursor.fetchall()
    conn.close()
    return ideas

def get_all_ideas():
    """Получить все идеи (для админки)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT i.*, u.first_name, u.username 
        FROM ideas i 
        JOIN users u ON i.user_id = u.id 
        ORDER BY i.created_at DESC
    ''')
    
    ideas = cursor.fetchall()
    conn.close()
    return ideas

def get_pending_ideas():
    """Получить идеи на модерации"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT i.*, u.first_name, u.username 
        FROM ideas i 
        JOIN users u ON i.user_id = u.id 
        WHERE i.status = 'pending'
        ORDER BY i.created_at DESC
    ''')
    
    ideas = cursor.fetchall()
    conn.close()
    
    return ideas

def update_idea_status(idea_id, status, saved_amount=None, moderator_comment=None):
    """Обновить статус идеи"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status == 'approved':
        cursor.execute('''
            UPDATE ideas 
            SET status = ?, saved_amount = ?, moderator_comment = ?, approved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (status, saved_amount, moderator_comment, idea_id))
    else:
        cursor.execute('''
            UPDATE ideas 
            SET status = ?, moderator_comment = ?
            WHERE id = ?
        ''', (status, moderator_comment, idea_id))
    
    conn.commit()
    conn.close()

def get_top_users():
    """Получить топ пользователей по одобренным идеям"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT u.first_name, COUNT(i.id) as approved_ideas
        FROM users u 
        LEFT JOIN ideas i ON u.id = i.user_id AND i.status = 'approved'
        GROUP BY u.id, u.first_name
        HAVING approved_ideas > 0
        ORDER BY approved_ideas DESC
        LIMIT 10
    ''')
    
    users = cursor.fetchall()
    conn.close()
    return users


def add_test_data(cursor):
    """Добавление тестовых данных"""
    # Добавляем тестовых пользователей
    test_users = [
        (111111111, 'Арсений Моисеев', 'arseny_m', True),
        (222222222, 'Дмитрий Мурзаев', 'dmitry_m', False),
        (333333333, 'Поликарпова Таисия', 'taisiya_p', False),
        (444444444, 'Владимир Мирошник', 'vladimir_m', False),
        (555555555, 'Сергей Быстров', 'sergey_b', False)
    ]
    
    cursor.executemany('''
        INSERT OR IGNORE INTO users (telegram_id, first_name, username, is_moderator)
        VALUES (?, ?, ?, ?)
    ''', test_users)
    
    # Получаем ID добавленных пользователей
    cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (111111111,))
    user_111 = cursor.fetchone()
    if user_111:
        moderator_id = user_111[0]
        print(f"Найден пользователь 111111111 с ID: {moderator_id}")
    else:
        print("Пользователь 111111111 не найден")
        return
    
    cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (222222222,))
    user_222 = cursor.fetchone()
    employee1_id = user_222[0] if user_222 else None
    
    cursor.execute('SELECT id FROM users WHERE telegram_id = ?', (333333333,))
    user_333 = cursor.fetchone()
    employee2_id = user_333[0] if user_333 else None
    
    test_ideas = [
        # Идеи для пользователя 111111111 (Арсений Моисеев)
        (moderator_id, 'Оптимизация маршрутов доставки в северном регионе', 
         'Снижение пробега на 15% и времени доставки на 20%', '', False, 'approved', 50000, 
         'Отличная идея! Реализуем в следующем квартале', '2024-01-15', '2024-01-20'),
        
        (moderator_id, 'Внедрение системы автоматического учета топлива', 
         'Снижение расхода топлива на 8% и исключение человеческого фактора', '', True, 'pending', 
         None, None, '2024-01-16', None),
        
        # Идеи для пользователя 222222222 (Дмитрий Мурзаев)
        (employee1_id, 'Единая система документооборота для всех филиалов', 
         'Ускорение обработки заказов на 30% и снижение ошибок', '', False, 'approved', 25000, 
         'Хорошая идея, но требует доработки', '2024-01-14', '2024-01-18'),
        
        # Идеи для пользователя 333333333 (Поликарпова Таисия)
        (employee2_id, 'Система мотивации для водителей', 
         'Повышение лояльности и снижение текучки кадров', '', False, 'pending', 
         None, None, '2024-01-17', None)
    ]
    
    cursor.executemany('''
        INSERT INTO ideas (user_id, description, justification, evidence_link, is_anonymous, 
                          status, saved_amount, moderator_comment, created_at, approved_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', test_ideas)