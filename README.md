
# Work Management Chatbot Backend API

This backend API powers a chatbot integrated into the [Work Management Platform](https://github.com/nmkha-github/TKPM), a group project built to help users manage tasks for teams effectively. The chatbot assists users by answering task-related queries, helping them manage workflows, and improving productivity.

In this project, I have also provided an example of the front-end implementation for the chatbot used for experimentation. The front-end is built using **React** with Material-UI for styling, and it communicates with the backend through an API to fetch and respond to user queries.

## Features
- Handle chat messages related to task and work management
- Provide chatbot responses based on user input and task-related contexts
- Built with Flask and integrated with a React frontend
- API endpoint to receive messages and process conversations

## Tech Stack
- **Backend**: Flask (Python), Vertex AI
- **Frontend**: React (integrated separately within the work management platform)
- **API Requests**: Axios for communication between the frontend chatbot and backend
- **Database**: Firebase Cloud Firestore

## Getting Started

### Prerequisites
Ensure you have the following installed:
- Python 3.x
- Flask, Flask-Cors
- Vertex AI SDK
- Firebase Admin Python SDK

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

## Future Improvements

- Integrate with the work management platform's task database for real-time task updates
- Add user authentication for personalized task management
- Implement logging and advanced error handling
- Incorporate NLP for more complex task queries

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
