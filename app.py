from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# データベース初期化関数
def init_db():
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                room TEXT NOT NULL,
                title TEXT NOT NULL,
                start DATETIME NOT NULL,
                end DATETIME
            )
        """)
        conn.commit()

# データベース初期化
init_db()

# ホームページルート
@app.route("/")
def home():
    return render_template("index.html")

# イベントを取得
@app.route("/get-events/<room>", methods=["GET"])
def get_events(room):
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        if room == "general":
            cursor.execute("SELECT id, title, start, end, room FROM events")
        else:
            cursor.execute("SELECT id, title, start, end, room FROM events WHERE room = ?", (room,))
        events = [
            {"id": row[0], "title": f"[{row[4]}] {row[1]}", "start": row[2], "end": row[3]}
            for row in cursor.fetchall()
        ]
    return jsonify(events)

# イベントを追加
@app.route("/add-event", methods=["POST"])
def add_event():
    data = request.json
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO events (room, title, start, end) VALUES (?, ?, ?, ?)",
            (data["room"], data["title"], data["start"], data["end"]),
        )
        conn.commit()
    return jsonify({"status": "success"})

# イベントを更新
@app.route("/update-event", methods=["POST"])
def update_event():
    data = request.json
    with sqlite3.connect("database.db") as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE events SET start = ?, end = ? WHERE id = ?",
            (data["start"], data["end"], data["id"]),
        )
        conn.commit()
    return jsonify({"status": "success"})

if __name__ == "__main__":
    app.run(debug=True)
