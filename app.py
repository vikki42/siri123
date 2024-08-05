from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from groq import Groq

app = Flask(__name__)
CORS(app)

load_dotenv()

api_key = os.getenv('GROQ_API_KEY')
if not api_key:
    raise ValueError("GROQ_API_KEY not found in environment variables")

client = Groq(api_key=api_key)

conversation_history = []

@app.route('/send_message', methods=['POST'])
def send_message():
    global conversation_history
    data = request.json
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    user_input = data['message']
    
    conversation_history.append({"role": "user", "content": user_input})
    
    try:
        chat_completion = client.chat.completions.create(
            messages=conversation_history,
            model="llama3-70b-8192",
        )
        
        model_response = chat_completion.choices[0].message.content
        conversation_history.append({"role": "assistant", "content": model_response})
        
        return jsonify({"response": model_response})
    except Exception as e:
        app.logger.error(f"Error in send_message: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)