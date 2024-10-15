
# Chatbot Backend API

This is a backend API for a chatbot, built using Flask. It provides endpoints for handling chat messages and integrates with a frontend chatbot interface. The API receives user messages, processes them, and returns responses from a language model.

## Features
- Handle user chat messages and history
- Return chatbot responses based on user input
- Built with Flask and integrates with a React frontend
- API endpoint to receive messages and process conversations

## Tech Stack
- **Backend**: Flask (Python)
- **Frontend**: React (integrated separately)
- **API Requests**: Axios for communication between the frontend and backend
- **Database**: (Optional) You can integrate a database for persistent chat history if needed.

## Getting Started

### Prerequisites
Make sure you have the following installed:
- Python 3.x
- Flask
- Any virtual environment tool (e.g., `venv` or `virtualenv`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the API

1. **Start the Flask server**:
   ```bash
   flask run
   ```

   By default, the API will be available at `http://127.0.0.1:5000`.

2. **Endpoint**:
   - POST `/api/chat`: Sends a chat message and receives a bot response.

### Example Request

Send a POST request to the `/api/chat` endpoint with the following JSON payload:

```json
{
  "room_id": "12345",
  "message": "Hello",
  "history": [
    {"role": "user", "text": "Hi there!"},
    {"role": "bot", "text": "Hello, how can I assist you today?"}
  ]
}
```

### Example Response
```json
{
  "response": "Sure, I can help you with that!"
}
```

## Configuration

You can configure environment variables and Flask settings in a `.env` file. Some common configurations include:
- `FLASK_ENV=development`: For development mode.
- `DEBUG=True`: To enable debug mode in Flask.

## Project Structure

```
.
├── app.py               # Main Flask app
├── requirements.txt     # Python dependencies
├── templates/           # Flask HTML templates (if applicable)
└── README.md            # Project documentation
```

## Future Improvements

- Integrate a database for persistent chat history
- Add user authentication and session management
- Enhance error handling and logging
- Add support for more advanced NLP features

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
