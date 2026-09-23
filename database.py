import sqlite3

def create_tables():

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_results(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        domain TEXT,
        score REAL
    )
    """)

    conn.commit()
    conn.close()