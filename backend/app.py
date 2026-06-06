from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sewage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Table ---
class Booking(db.Model):
    id      = db.Column(db.Integer, primary_key=True)
    name    = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    phone   = db.Column(db.String(20),  nullable=False)
    date    = db.Column(db.String(50),  nullable=False)
    time    = db.Column(db.String(50),  nullable=False, default='')
    status  = db.Column(db.String(20),  default='pending')
# --- Routes ---
@app.route('/')
def home():
    return jsonify({'message': 'Sewage Truck API is running!'})

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    booking = Booking(
        name    = data['name'],
        address = data['address'],
        phone   = data['phone'],
        date    = data['date'],
        time = data.get('time', ''),
        
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify({'message': 'Booking created successfully!', 'id': booking.id})

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    return jsonify([{
        'id':      b.id,
        'name':    b.name,
        'address': b.address,
        'phone':   b.phone,
        'date':    b.date,
        'status':  b.status
    } for b in bookings])

@app.route('/api/bookings/<int:id>/accept', methods=['PUT'])
def accept_booking(id):
    booking = Booking.query.get(id)
    if not booking:
        return jsonify({'message': 'Booking not found'}), 404
    booking.status = 'accepted'
    db.session.commit()
    return jsonify({'message': 'Booking accepted!'})
import anthropic

@app.route('/api/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    client = anthropic.Anthropic(api_key="YOUR_API_KEY_HERE")
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system="You are a helpful assistant for a sewage truck booking service in India. Help users understand the service, book cleanings, and answer questions about pricing and timing. Be friendly and brief.",
        messages=[{"role": "user", "content": user_message}]
    )
    return jsonify({'reply': response.content[0].text})

# --- Login Route ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    users = {
        'user':     {'password': 'user123',     'role': 'user'},
        'operator': {'password': 'operator123', 'role': 'operator'},
    }

    if username in users and users[username]['password'] == password:
        return jsonify({'success': True, 'role': users[username]['role']})
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)