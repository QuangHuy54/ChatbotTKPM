
# Work Management Chatbot Backend API

This is the backend API for a chatbot integrated into a work management platform, built using Flask. The API handles chat messages from users, processes them, and returns appropriate responses. It aims to assist users in managing their tasks and work-related queries through the chatbot interface.

## Features
- Handle chat messages related to task and work management
- Provide chatbot responses based on user input and task-related contexts
- Built with Flask and integrated with a React frontend
- API endpoint to receive messages and process conversations

## Tech Stack
- **Backend**: Flask (Python)
- **Frontend**: React (integrated separately within the work management platform)
- **API Requests**: Axios for communication between the frontend chatbot and backend
- **Database**: (Optional) For persistent chat history or work data integration

## Getting Started

### Prerequisites
Ensure you have the following installed:
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

   The API will be available at `http://127.0.0.1:5000`.

2. **Endpoint**:
   - POST `/api/chat`: Sends a chat message related to task management and receives a bot response.

### Example Request

Send a POST request to the `/api/chat` endpoint with the following JSON payload:

```json
{
  "room_id": "12345",
  "message": "What's my task for today?",
  "history": [
    {"role": "user", "text": "What are my tasks?"},
    {"role": "bot", "text": "You have 3 tasks pending today."}
  ]
}
```

### Example Response
```json
{
  "response": "Your task for today is to finalize the project report."
}
```

### Configuration

Environment variables and Flask settings can be configured in a `.env` file. Common configurations include:
- `FLASK_ENV=development`: For development mode.
- `DEBUG=True`: To enable Flask debug mode.

## Project Structure

```
.
├── app.py               # Main Flask app
├── requirements.txt     # Python dependencies
├── templates/           # Flask HTML templates (if applicable)
└── README.md            # Project documentation
```

## Future Improvements

- Integrate with the work management platform's task database for real-time task updates
- Add user authentication for personalized task management
- Implement logging and advanced error handling
- Incorporate NLP for more complex task queries

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
