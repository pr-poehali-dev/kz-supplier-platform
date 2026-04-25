import json
import os
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


def _user_from_token(token: str):
    if not token:
        return None
    sql = (
        f"SELECT u.id, u.name, u.email FROM {SCHEMA}.sessions s "
        f"JOIN {SCHEMA}.users u ON s.user_id = u.id WHERE s.token = {_esc(token)}"
    )
    with _conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql)
            return cur.fetchone()


def handler(event: dict, context) -> dict:
    """Получение и добавление отзывов к товарам"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    try:
        if method == 'GET':
            qs = event.get('queryStringParameters') or {}
            product_id = qs.get('product_id')
            if not product_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'product_id required'})}
            sql = (
                f"SELECT id, product_id, user_id, author_name, rating, text, created_at "
                f"FROM {SCHEMA}.reviews WHERE product_id = {_esc(int(product_id))} ORDER BY created_at DESC"
            )
            with _conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(sql)
                    rows = cur.fetchall()
            items = []
            total_rating = 0
            for r in rows:
                items.append({
                    'id': r['id'],
                    'author_name': r['author_name'],
                    'rating': r['rating'],
                    'text': r['text'] or '',
                    'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                })
                total_rating += r['rating']
            avg = round(total_rating / len(rows), 1) if rows else 0
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'items': items, 'avg_rating': avg, 'count': len(rows)})}

        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            product_id = body.get('product_id')
            rating = int(body.get('rating') or 0)
            text = (body.get('text') or '').strip()
            author_name = (body.get('author_name') or '').strip()
            if not product_id or rating < 1 or rating > 5:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'product_id и rating (1-5) обязательны'})}

            user = _user_from_token(token)
            user_id = user['id'] if user else None
            if user and not author_name:
                author_name = user['name'] or user['email'].split('@')[0]
            if not author_name:
                author_name = 'Гость'

            sql = (
                f"INSERT INTO {SCHEMA}.reviews (product_id, user_id, author_name, rating, text) "
                f"VALUES ({_esc(int(product_id))}, {_esc(user_id)}, {_esc(author_name)}, {_esc(rating)}, {_esc(text)}) RETURNING id"
            )
            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    new_id = cur.fetchone()[0]
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'id': new_id, 'success': True})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'method not allowed'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
