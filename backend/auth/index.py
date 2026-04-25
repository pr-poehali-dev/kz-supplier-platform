import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
}

SCHEMA = 't_p6351432_kz_supplier_platform'


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _esc(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    s = str(value).replace("'", "''")
    return f"'{s}'"


def _hash_password(password: str) -> str:
    salt = "prosupply_salt_2026"
    return hashlib.sha256((salt + password).encode()).hexdigest()


def handler(event: dict, context) -> dict:
    """Регистрация, вход и получение текущего пользователя"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        if method == 'GET':
            headers = event.get('headers') or {}
            token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
            if not token:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'no token'})}
            sql = (
                f"SELECT u.id, u.email, u.name FROM {SCHEMA}.sessions s "
                f"JOIN {SCHEMA}.users u ON s.user_id = u.id WHERE s.token = {_esc(token)}"
            )
            with _conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(sql)
                    row = cur.fetchone()
                    if not row:
                        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'invalid token'})}
                    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'user': {'id': row['id'], 'email': row['email'], 'name': row['name'] or ''}})}

        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'register':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            name = (body.get('name') or '').strip()
            if not email or not password or len(password) < 6:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'email и пароль (мин 6) обязательны'})}
            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = {_esc(email)}")
                    if cur.fetchone():
                        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'email уже занят'})}
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.users (email, password_hash, name) "
                        f"VALUES ({_esc(email)}, {_esc(_hash_password(password))}, {_esc(name)}) RETURNING id"
                    )
                    user_id = cur.fetchone()[0]
                    token = secrets.token_hex(32)
                    cur.execute(f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES ({_esc(token)}, {_esc(user_id)})")
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name}})}

        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not email or not password:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'email и пароль обязательны'})}
            with _conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(f"SELECT id, password_hash, name FROM {SCHEMA}.users WHERE email = {_esc(email)}")
                    row = cur.fetchone()
                    if not row or row['password_hash'] != _hash_password(password):
                        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'неверный email или пароль'})}
                    token = secrets.token_hex(32)
                    cur.execute(f"INSERT INTO {SCHEMA}.sessions (token, user_id) VALUES ({_esc(token)}, {_esc(row['id'])})")
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'token': token, 'user': {'id': row['id'], 'email': email, 'name': row['name'] or ''}})}

        return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'unknown action'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
