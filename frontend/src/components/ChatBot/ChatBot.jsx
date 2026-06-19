import React, { useState, useEffect } from 'react';
import { useMediaQuery, useTheme, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatWindow from './ChatWindow';

const FloatingButton = styled(IconButton)(({ theme, open }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: 9999,
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 50%, #A6DCE3 100%)',
  color: '#FFFFFF',
  boxShadow: '0 8px 32px rgba(47, 124, 123, 0.35)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: open ? 'none' : 'pulse 2s infinite',
  '&:hover': {
    transform: 'scale(1.08)',
    boxShadow: '0 12px 40px rgba(47, 124, 123, 0.45)',
    animation: 'none',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(47, 124, 123, 0.4)',
    },
    '70%': {
      boxShadow: '0 0 0 12px rgba(47, 124, 123, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(47, 124, 123, 0)',
    },
  },
}));

const AILogo = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="aiGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#E6F7F9" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="22" stroke="url(#aiGradient)" strokeWidth="2" fill="none" />
    <path d="M16 20c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm12 8l6 6" stroke="url(#aiGradient)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="20" r="2" fill="url(#aiGradient)" />
    <circle cx="30" cy="20" r="2" fill="url(#aiGradient)" />
  </svg>
);

const ChatBot = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);

  const handleToggle = () => setOpen(!open);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <>
      <FloatingButton
        open={open}
        onClick={handleToggle}
        aria-label="Open AI Assistant Chat"
        aria-expanded={open}
      >
        <AILogo />
      </FloatingButton>

      <ChatWindow
        open={open}
        onClose={handleClose}
        isMobile={isMobile}
      />
    </>
  );
};

export default ChatBot;