import sqlite3

def show_dashboard(username):

    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    cursor.execute(
    "SELECT domain, score FROM interview_results WHERE username=?",
    (username,)
    )

    results = cursor.fetchall()

    print("\n===== Interview Dashboard =====")

    for r in results:
        print("Domain:", r[0], "| Score:", r[1])

    conn.close()