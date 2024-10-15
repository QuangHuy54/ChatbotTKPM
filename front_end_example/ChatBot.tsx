import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  Divider,
  Grow,
} from "@mui/material";
import { styled } from "@mui/system";
import { useChatbot } from "../../lib/provider/ChatbotProvider";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useRooms } from "../../lib/provider/RoomsProvider";
import { useUser } from "../../lib/provider/UserProvider";
interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const ChatBubble = styled(Paper)(({ sender }: { sender: "user" | "bot" }) => ({
  padding: "10px",
  borderRadius: "20px",
  maxWidth: "70%",
  backgroundColor: sender === "user" ? "#3f51b5" : "#e0e0e0",
  color: sender === "user" ? "white" : "black",
  transition: "0.3s",
  "&:hover": {
    boxShadow:
      sender === "user"
        ? "0px 0px 20px rgba(63, 81, 181, 0.5)"
        : "0px 0px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const Chatbot: React.FC = () => {
  const { isOpen } = useChatbot();
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { currentRoom } = useRooms();
  const { user } = useUser();

  // Ref to keep track of the chat list container for scrolling
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };
    setInput(""); 
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    try{
      const response = await axios.post(
        "http://127.0.0.1:5000/api/chat",
        {
          user_id: user?.id||"",
          room_id: currentRoom.id||"",
          message: input,
          history: messages.map((message) => ({
            role: message.sender === "user" ? "user" : "model",
            text: message.text,
          })),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    setInput("");

    // Simulate bot response
    const botMessage: Message = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
    // Simulate delay
  }
  catch (error) {
    console.error("Error fetching bot response:", error);
    // Handle error response (optional)
    const errorMessage: Message = {
      text: "Sorry, I couldn't get a response from the server.",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prevMessages) => [...prevMessages, errorMessage]);
    
  };
}

  return (
    <Grow
      in={isOpen}
      style={{ transformOrigin: "bottom right" }}
      timeout={200} // 500ms for a slower "pop" effect
      mountOnEnter
      unmountOnExit
    >
      <Box
        sx={{
          width: "400px",
          position: "fixed",
          bottom: "80px",
          right: "16px",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
          zIndex: 9999,
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ fontFamily: "Arial, sans-serif", color: "#333" }}
        >
          Chatbot
        </Typography>
        <Paper
          elevation={3}
          sx={{
            maxHeight: "400px",
            overflowY: "auto",
            padding: "10px",
            borderRadius: "10px",
            backgroundColor: "#fff",
          }}
          ref={chatContainerRef} // Attach the ref to the chat container
        >
          <List>
            {messages.map((msg, index) => (
              <div key={index}>
                <ListItem
                  sx={{
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <ChatBubble sender={msg.sender}>
                    {msg.text}
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "right",
                        opacity: 0.6,
                      }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </ChatBubble>
                </ListItem>
                {index < messages.length - 1 && <Divider />}
              </div>
            ))}
            {isTyping && (
              <ListItem>
                <Typography variant="body2" color="gray">
                  Bot is typing...
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
        <Box sx={{ display: "flex", marginTop: "10px" }}>
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            sx={{ borderRadius: "20px" }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            sx={{
              marginLeft: "10px",
              borderRadius: "20px",
              backgroundColor: "#3f51b5",
              "&:hover": {
                backgroundColor: "#303f9f",
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Grow>
  );
};

export default Chatbot;
