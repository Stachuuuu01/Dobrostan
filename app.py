from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

# API dla Admina: Wysyłanie wiadomości do konkretnego KODU
@app.route('/api/send_message', methods=['POST'])
def send_message():
    data = request.json
    kod_odbiorcy = data.get('kod_odbiorcy')
    tresc = data.get('tresc')
    od = data.get('od', 'Administracja')

    if not kod_odbiorcy or not tresc:
        return jsonify({"error": "Brak kodu odbiorcy lub treści"}), 400

    db = get_db()
    db.execute(
        "INSERT INTO messages (kod_odbiorcy, tresc, od, kiedy) VALUES (?, ?, ?, ?)",
        (kod_odbiorcy, tresc, od, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    )
    db.commit()
    return jsonify({"status": "success"})

# API dla Ucznia: Pobieranie wiadomości przypisanych do jego KODU
@app.route('/api/get_user_messages', methods=['GET'])
def get_user_messages():
    user_code = request.args.get('code')
    if not user_code:
        return jsonify([])

    db = get_db()
    messages = db.execute(
        "SELECT tresc, od, kiedy FROM messages WHERE kod_odbiorcy = ? ORDER BY kiedy DESC",
        (user_code,)
    ).fetchall()
    
    return jsonify([dict(msg) for msg in messages])

if __name__ == '__main__':
    app.run(debug=True)
