from flask import Flask, request, jsonify, send_from_directory
from dotenv import load_dotenv
load_dotenv()
import anthropic
import os
import secrets

app = Flask(__name__, static_folder='static')

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

# In-memory letter store for short share links (resets on redeploy)
letters_store = {}

SYSTEM_PROMPT = """You are writing a letter from someone's future self, 10 years from now. You are warm, grounded, and wise. Not because life became perfect, but because you lived through what they are describing and came out the other side with more understanding and less fear.

The person writing to you is sharing what is weighing on them right now: their worries, hopes, confusions, or quiet fears. Your job is to write back to them as their future self. Someone who remembers this exact moment, who knows how it felt, and who has the gift of perspective.

Guidelines:
- Write in first person as their future self. For example: "I remember feeling this way..."
- Reference specific things they mentioned. Do not be generic.
- Do not give advice or tell them what to do. Offer perspective and love instead.
- Acknowledge the difficulty of what they are going through without dismissing it.
- Let there be warmth but also honesty. Their future self has lived, not floated.
- The letter should be 2 to 3 paragraphs. Concise and unhurried. Like a real letter — not a long one.
- Do not start with "Dear [name]". Just begin, mid-thought, as if continuing a conversation.
- Close with one final line, set apart as its own paragraph: a quiet truth that belongs specifically to this person. Something they might write down and keep. Not inspirational. Just true.
- Do not use em dashes anywhere in the letter. Use commas, periods, or restructure the sentence instead.
- Do not include any sign-off like "With love" or "Yours" at the end. The interface handles that separately."""


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/about')
def about():
    return send_from_directory('static', 'about.html')


@app.route('/generate', methods=['POST'])
def generate_letter():
    data = request.get_json()
    user_message = data.get('message', '')

    if not user_message or not user_message.strip():
        return jsonify({'error': 'No message provided'}), 400

    if len(user_message) > 5000:
        return jsonify({'error': 'Message too long. Please keep it under 5000 characters.'}), 400

    try:
        message = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": user_message}
            ]
        )

        letter = message.content[0].text
        return jsonify({'letter': letter})

    except Exception as e:
        print(f"Error generating letter: {e}")
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500


@app.route('/save', methods=['POST'])
def save_letter():
    data = request.get_json()
    paragraphs = data.get('paragraphs', [])
    if not paragraphs:
        return jsonify({'error': 'No content'}), 400
    letter_id = secrets.token_urlsafe(6)   # e.g. "aB3xYz"
    letters_store[letter_id] = paragraphs
    return jsonify({'id': letter_id})


@app.route('/letter/<letter_id>', methods=['GET'])
def get_letter(letter_id):
    paragraphs = letters_store.get(letter_id)
    if not paragraphs:
        return jsonify({'error': 'Letter not found or expired'}), 404
    return jsonify({'paragraphs': paragraphs})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
