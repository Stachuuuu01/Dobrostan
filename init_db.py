import sqlite3

def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    # Tabela głosów (już istnieje, upewnij się że ma kolumnę kod)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kto TEXT,
            nastroj TEXT,
            powod TEXT,
            kiedy DATETIME,
            kod TEXT
        )
    ''')
    # NOWA/ZAKTUALIZOWANA Tabela wiadomości
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kod_odbiorcy TEXT,
            tresc TEXT,
            od TEXT,
            kiedy DATETIME DEFAULT CURRENT_TIMESTAMP,
            przeczytane INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
