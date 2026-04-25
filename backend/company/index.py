import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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


def _user_id_from_token(token: str):
    if not token:
        return None
    sql = f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = {_esc(token)}"
    with _conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
            return row[0] if row else None


def _company_row_to_dict(r):
    return {
        'id': r['id'],
        'user_id': r['user_id'],
        'name': r['name'],
        'logo_url': r['logo_url'] or '',
        'description': r['description'] or '',
        'category': r['category'] or '',
        'location': r['location'] or '',
        'phone': r['phone'] or '',
        'email': r['email'] or '',
        'website': r['website'] or '',
    }


def handler(event: dict, context) -> dict:
    """Карточка компании пользователя: создание, чтение, обновление"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    try:
        if method == 'GET':
            qs = event.get('queryStringParameters') or {}
            list_all = qs.get('all') == '1'
            if list_all:
                sql = (
                    f"SELECT c.*, "
                    f"(SELECT COUNT(*) FROM {SCHEMA}.products p WHERE p.user_id = c.user_id) AS products_count "
                    f"FROM {SCHEMA}.companies c ORDER BY c.created_at DESC"
                )
                with _conn() as conn:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute(sql)
                        rows = cur.fetchall()
                items = []
                for r in rows:
                    d = _company_row_to_dict(r)
                    d['products_count'] = int(r['products_count'])
                    items.append(d)
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'items': items})}

            user_id = _user_id_from_token(token)
            if not user_id:
                return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'unauthorized'})}
            with _conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(f"SELECT * FROM {SCHEMA}.companies WHERE user_id = {_esc(user_id)}")
                    row = cur.fetchone()
                    if not row:
                        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'company': None})}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'company': _company_row_to_dict(row)})}

        user_id = _user_id_from_token(token)
        if not user_id:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'unauthorized'})}

        body = json.loads(event.get('body') or '{}')

        if method in ('POST', 'PUT'):
            name = (body.get('name') or '').strip()
            if not name:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'name required'})}

            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(f"SELECT id FROM {SCHEMA}.companies WHERE user_id = {_esc(user_id)}")
                    existing = cur.fetchone()
                    fields = {
                        'name': name,
                        'logo_url': body.get('logo_url') or '',
                        'description': body.get('description') or '',
                        'category': body.get('category') or '',
                        'location': body.get('location') or '',
                        'phone': body.get('phone') or '',
                        'email': body.get('email') or '',
                        'website': body.get('website') or '',
                    }
                    if existing:
                        sets = ', '.join([f"{k} = {_esc(v)}" for k, v in fields.items()] + ['updated_at = NOW()'])
                        cur.execute(f"UPDATE {SCHEMA}.companies SET {sets} WHERE user_id = {_esc(user_id)}")
                    else:
                        keys = ['user_id'] + list(fields.keys())
                        values = [_esc(user_id)] + [_esc(v) for v in fields.values()]
                        cur.execute(f"INSERT INTO {SCHEMA}.companies ({', '.join(keys)}) VALUES ({', '.join(values)})")
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'method not allowed'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
