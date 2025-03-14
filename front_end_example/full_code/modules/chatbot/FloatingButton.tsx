import React from 'react';
import { Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useChatbot } from '../../lib/provider/ChatbotProvider';

const FloatingButton: React.FC = () => {
  const { toggleChat } = useChatbot();

  return (
    <Fab
      color="primary"
      aria-label="chat"
      sx={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
      }}
      onClick={toggleChat}
    >
      <ChatIcon />
    </Fab>
  );
};

export default FloatingButton;