import json
import os
import re
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


def _parse_video(url):
    u = (url or '').strip()
    if not u:
        return None, ''
    yt = re.search(r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([\w-]{6,})', u)
    if yt:
        return 'youtube', yt.group(1)
    rt = re.search(r'rutube\.ru/(?:video(?:/private)?|play/embed|shorts)/([a-f0-9A-Z_-]{6,})', u)
    if rt:
        return 'rutube', rt.group(1)
    return None, ''


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
        'telegram': r.get('telegram') or '',
        'whatsapp': r.get('whatsapp') or '',
        'vk': r.get('vk') or '',
        'instagram': r.get('instagram') or '',
        'wechat': r.get('wechat') or '',
    }


def handler(event: dict, context) -> dict:
    """Карточка компании пользователя: создание, чтение, обновление"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    qs = event.get('queryStringParameters') or {}
    resource = qs.get('resource') or ''

    try:
        if resource == 'videos':
            return _handle_videos(method, qs, token, event)
        if method == 'GET':
            list_all = qs.get('all') == '1'
            target_user_qs = qs.get('user_id')
            if target_user_qs and not list_all:
                with _conn() as conn:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute(f"SELECT * FROM {SCHEMA}.companies WHERE user_id = {_esc(int(target_user_qs))}")
                        row = cur.fetchone()
                if not row:
                    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'company': None})}
                return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'company': _company_row_to_dict(row)})}
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
                        'telegram': body.get('telegram') or '',
                        'whatsapp': body.get('whatsapp') or '',
                        'vk': body.get('vk') or '',
                        'instagram': body.get('instagram') or '',
                        'wechat': body.get('wechat') or '',
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

        if method == 'DELETE':
            target_id = body.get('id') or qs.get('id')
            target_user_id = body.get('user_id') or qs.get('user_id')
            if not target_id and not target_user_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id or user_id required'})}
            with _conn() as conn:
                with conn.cursor() as cur:
                    if target_id:
                        cur.execute(f"SELECT user_id FROM {SCHEMA}.companies WHERE id = {_esc(int(target_id))}")
                        row = cur.fetchone()
                        if not row:
                            return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'not found'})}
                        owner_id = row[0]
                    else:
                        owner_id = int(target_user_id)
                    cur.execute(f"DELETE FROM {SCHEMA}.videos WHERE user_id = {_esc(owner_id)}")
                    cur.execute(f"DELETE FROM {SCHEMA}.products WHERE user_id = {_esc(owner_id)}")
                    cur.execute(f"DELETE FROM {SCHEMA}.companies WHERE user_id = {_esc(owner_id)}")
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'method not allowed'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}


def _handle_videos(method, qs, token, event):
    if method == 'GET':
        target_user = qs.get('user_id')
        if not target_user:
            target_user = _user_id_from_token(token)
        if not target_user:
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'items': []})}
        sql = f"SELECT id, title, url, provider, video_id, created_at FROM {SCHEMA}.videos WHERE user_id = {_esc(int(target_user))} ORDER BY created_at DESC"
        with _conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(sql)
                rows = cur.fetchall()
        items = [{
            'id': r['id'],
            'title': r['title'] or '',
            'url': r['url'],
            'provider': r['provider'],
            'video_id': r['video_id'],
            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
        } for r in rows]
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'items': items})}

    user_id = _user_id_from_token(token)
    if not user_id:
        return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'unauthorized'})}

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        url = (body.get('url') or '').strip()
        title = (body.get('title') or '').strip()
        provider, vid = _parse_video(url)
        if not provider or not vid:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Поддерживаются ссылки YouTube или RuTube'})}
        sql = (
            f"INSERT INTO {SCHEMA}.videos (user_id, title, url, provider, video_id) "
            f"VALUES ({_esc(user_id)}, {_esc(title)}, {_esc(url)}, {_esc(provider)}, {_esc(vid)}) RETURNING id"
        )
        with _conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                new_id = cur.fetchone()[0]
                conn.commit()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'id': new_id, 'provider': provider, 'video_id': vid, 'success': True})}

    if method == 'DELETE':
        vid_id = body.get('id')
        if not vid_id:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
        sql = f"DELETE FROM {SCHEMA}.videos WHERE id = {_esc(int(vid_id))} AND user_id = {_esc(user_id)}"
        with _conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                conn.commit()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

    return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'method not allowed'})}