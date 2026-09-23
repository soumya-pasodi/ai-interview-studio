from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/question")
def get_question():
    return jsonify({
        "question": "What is Artificial Intelligence?"
    })

if __name__ == "__main__":
    app.run(debug=True)