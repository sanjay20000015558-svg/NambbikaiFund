import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Slide
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import chatbotService from '../../services/chatbotService';

const WindowContainer = styled(Paper)(({ theme, ismobile }) => ({
  position: 'fixed',
  bottom: ismobile ? 0 : 100,
  right: ismobile ? 0 : 32,
  width: ismobile ? '100%' : 400,
  height: ismobile ? '100%' : 600,
  maxHeight: 'calc(100vh - 120px)',
  zIndex: 9998,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: ismobile ? 0 : '20px',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(47, 124, 123, 0.15)',
  boxShadow: '0 20px 60px rgba(47, 124, 123, 0.25)',
}));

const Header = styled(Box)(({ theme, ismobile }) => ({
  padding: '16px 20px',
  background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const MessagesArea = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}));

const AILogo = () => (
  <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E6F7F9" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" stroke="url(#aiGrad)" strokeWidth="2" fill="none" />
    <path d="M20 22a4 4 0 1 0 0 0 4 4 0 1 8 0 4-4 4 0 1 8 0" stroke="url(#aiGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M28 28l6 6" stroke="url(#aiGrad)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="20" r="2" fill="url(#aiGrad)" />
    <circle cx="30" cy="20" r="2" fill="url(#aiGrad)" />
  </svg>
);

const ChatWindow = ({ open, onClose, isMobile }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('chatbot_messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        setMessages([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatbot_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content) => {
    if (!content.trim()) return;

    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage([...messages, userMessage]);
      if (response.success) {
        const aiMessage = { role: 'assistant', content: response.message };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = { role: 'assistant', content: response.message || 'Sorry, I am having trouble responding. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = { role: 'assistant', content: error.message || 'Sorry, I am having trouble responding. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([]);
      localStorage.removeItem('chatbot_messages');
    }
  };

  return (
    <>
      <Slide in={open} direction="up">
        <WindowContainer ismobile={isMobile}>
          <Header>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box width={32} height={32}><AILogo /></Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>Nambikkai AI Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  🟢 Online • Powered by Groq
                </Typography>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={handleClear} size="small" sx={{ color: 'white', mr: 0.5 }} aria-label="Clear chat">
                <Typography variant="caption">🗑</Typography>
              </IconButton>
              <IconButton onClick={onClose} size="small" sx={{ color: 'white' }} aria-label="Close chat">
                <CloseIcon />
              </IconButton>
            </Box>
          </Header>

          <MessagesArea>
            {messages.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                Hello! I am Nambikkai's AI Assistant. How can I help you today?
              </Typography>
            )}
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isLoading && (
              <ChatMessage message={{ role: 'assistant', content: '' }} isLoading />
            )}
            <Box ref={messagesEndRef} />
          </MessagesArea>

          <ChatInput onSend={handleSend} disabled={isLoading} />
        </WindowContainer>
      </Slide>
    </>
  );
};

export default ChatWindow;