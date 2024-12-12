from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello, Railway!"

@app.route("/health")
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
