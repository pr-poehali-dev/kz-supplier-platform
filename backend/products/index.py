import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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


def handler(event: dict, context) -> dict:
    """CRUD товаров для админки и каталога"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    try:
        if method == 'GET':
            qs = event.get('queryStringParameters') or {}
            category = qs.get('category')
            where = ''
            if category:
                where = f"WHERE category = {_esc(category)}"
            sql = f"SELECT id, title, category, price, currency, moq, description, image_url, supplier, in_stock, created_at FROM {SCHEMA}.products {where} ORDER BY created_at DESC"
            with _conn() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(sql)
                    rows = cur.fetchall()
                    items = []
                    for r in rows:
                        items.append({
                            'id': r['id'],
                            'title': r['title'],
                            'category': r['category'],
                            'price': float(r['price']) if r['price'] is not None else 0,
                            'currency': r['currency'],
                            'moq': r['moq'],
                            'description': r['description'] or '',
                            'image_url': r['image_url'] or '',
                            'supplier': r['supplier'] or '',
                            'in_stock': r['in_stock'],
                            'created_at': r['created_at'].isoformat() if r['created_at'] else None,
                        })
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'items': items})}

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            title = body.get('title', '').strip()
            category = body.get('category', '').strip()
            if not title or not category:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'title and category required'})}
            price = float(body.get('price') or 0)
            currency = body.get('currency') or 'RUB'
            moq = int(body.get('moq') or 1)
            description = body.get('description') or ''
            image_url = body.get('image_url') or ''
            supplier = body.get('supplier') or ''
            in_stock = bool(body.get('in_stock', True))
            sql = (
                f"INSERT INTO {SCHEMA}.products (title, category, price, currency, moq, description, image_url, supplier, in_stock) "
                f"VALUES ({_esc(title)}, {_esc(category)}, {_esc(price)}, {_esc(currency)}, {_esc(moq)}, {_esc(description)}, {_esc(image_url)}, {_esc(supplier)}, {_esc(in_stock)}) RETURNING id"
            )
            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    new_id = cur.fetchone()[0]
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'id': new_id, 'success': True})}

        if method == 'PUT':
            pid = body.get('id')
            if not pid:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
            updates = []
            for field in ['title', 'category', 'currency', 'description', 'image_url', 'supplier']:
                if field in body:
                    updates.append(f"{field} = {_esc(body[field])}")
            if 'price' in body:
                updates.append(f"price = {_esc(float(body['price']))}")
            if 'moq' in body:
                updates.append(f"moq = {_esc(int(body['moq']))}")
            if 'in_stock' in body:
                updates.append(f"in_stock = {_esc(bool(body['in_stock']))}")
            if not updates:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'no fields'})}
            updates.append('updated_at = NOW()')
            sql = f"UPDATE {SCHEMA}.products SET {', '.join(updates)} WHERE id = {_esc(int(pid))}"
            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        if method == 'DELETE':
            pid = body.get('id')
            if not pid:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'id required'})}
            sql = f"DELETE FROM {SCHEMA}.products WHERE id = {_esc(int(pid))}"
            with _conn() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'success': True})}

        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'method not allowed'})}

    except Exception as e:
        return {'statusCode': 500, 'headers': CORS_HEADERS, 'body': json.dumps({'error': str(e)})}
