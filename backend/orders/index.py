import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """
    Управление заказами: создание заказа из корзины и получение списка заказов пользователя.
    Args: event - dict с httpMethod, body, headers; context - объект с request_id
    Returns: HTTP response dict со статусом и телом
    """
    method = event.get('httpMethod', 'GET')
    headers_cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers_cors, 'body': ''}

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        name = (body.get('customer_name') or '').strip().replace("'", "''")
        email = (body.get('customer_email') or '').strip().replace("'", "''")
        phone = (body.get('customer_phone') or '').strip().replace("'", "''")
        address = (body.get('delivery_address') or '').strip().replace("'", "''")
        comment = (body.get('comment') or '').strip().replace("'", "''")
        items = body.get('items') or []
        currency = (body.get('currency') or 'RUB').replace("'", "''")

        if not name or not email or not phone or not items:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**headers_cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Не заполнены обязательные поля или корзина пуста'}),
            }

        total = 0.0
        for it in items:
            total += float(it.get('price') or 0) * int(it.get('quantity') or 0)

        cur.execute(
            f"INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, comment, total_amount, currency, status) "
            f"VALUES ('{name}', '{email}', '{phone}', '{address}', '{comment}', {total}, '{currency}', 'new') RETURNING id, created_at"
        )
        row = cur.fetchone()
        order_id = row[0]
        created_at = row[1].isoformat() if row[1] else None

        for it in items:
            pid = int(it.get('productId') or 0)
            ptitle = (it.get('title') or '').replace("'", "''")[:500]
            pprice = float(it.get('price') or 0)
            pcur = (it.get('currency') or 'RUB').replace("'", "''")
            pqty = int(it.get('quantity') or 1)
            pimg = (it.get('image_url') or '').replace("'", "''")
            cur.execute(
                f"INSERT INTO order_items (order_id, product_id, product_title, price, currency, quantity, image_url) "
                f"VALUES ({order_id}, {pid}, '{ptitle}', {pprice}, '{pcur}', {pqty}, '{pimg}')"
            )

        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**headers_cors, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'id': order_id,
                'total_amount': total,
                'currency': currency,
                'status': 'new',
                'created_at': created_at,
            }),
        }

    if method == 'GET':
        cur.execute(
            "SELECT id, customer_name, customer_email, customer_phone, total_amount, currency, status, created_at "
            "FROM orders ORDER BY created_at DESC LIMIT 100"
        )
        rows = cur.fetchall()
        result = []
        for r in rows:
            result.append({
                'id': r[0],
                'customer_name': r[1],
                'customer_email': r[2],
                'customer_phone': r[3],
                'total_amount': float(r[4]) if r[4] is not None else 0,
                'currency': r[5],
                'status': r[6],
                'created_at': r[7].isoformat() if r[7] else None,
            })
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**headers_cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'orders': result}),
        }

    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {**headers_cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}),
    }
