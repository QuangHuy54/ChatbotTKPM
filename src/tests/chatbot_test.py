import chatbot
import json

def test_index() -> str:
    chatbot.app.testing = True
    client = chatbot.app.test_client()
    data_test={
        "room_id":"WVo9e2P9zgJMQddmZzRC",
        "message":"Can you tell me how much members and tasks are currently in the room ?",
        "history":[{'role':'model','text':'What can I help with ?'}]
    }
    r = client.post("/api/chat",data=json.dumps(data_test), content_type='application/json')
    print("Hello")
    assert r.status_code == 200
