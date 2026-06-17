import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Markdown from 'markdown-to-jsx';

const MessageBubble = styled(Paper)(({ theme, issender }) => ({
  padding: '12px 16px',
  maxWidth: '80%',
  borderRadius: issender ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  background: issender
    ? 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)'
    : 'rgba(240, 248, 250, 0.8)',
  color: issender ? '#FFFFFF' : '#1A1A1A',
  backdropFilter: issender ? 'none' : 'blur(10px)',
  border: issender ? 'none' : '1px solid rgba(47, 124, 123, 0.1)',
  boxShadow: issender
    ? '0 4px 12px rgba(47, 124, 123, 0.25)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)',
}));

const TypingIndicator = () => (
  <Box display="flex" gap={0.5} alignItems="center">
    {[0, 150, 300].map((delay) => (
      <Box
        key={delay}
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#2F7C7B',
          animation: 'bounce 1.4s infinite ease-in-out',
          animationDelay: `${delay}ms`,
        }}
      />
    ))}
  </Box>
);

const ChatMessage = ({ message, isLoading }) => {
  const isUser = message.role === 'user';
  const theme = useTheme();

  return (
    <Box
      display="flex"
      justifyContent={isUser ? 'flex-end' : 'flex-start'}
      alignItems="flex-end"
      gap={1}
    >
      {!isUser && (
        <Box
          width={32}
          height={32}
          borderRadius="50%"
          background="linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={12}
        >
          AI
        </Box>
      )}
      <MessageBubble issender={isUser}>
        {isLoading ? (
          <TypingIndicator />
        ) : (
          <Typography
            variant="body2"
            component="div"
            sx={{
              '& a': { color: isUser ? '#E6F7F9' : '#2F7C7B', textDecoration: 'underline' },
              '& code': { background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4 },
              '& pre': { background: 'rgba(0,0,0,0.03)', p: 1, borderRadius: 4, overflow: 'auto' },
            }}
          >
            <Markdown options={{ wrapperClasses: 'markdown-content' }}>
              {message.content}
            </Markdown>
          </Typography>
        )}
      </MessageBubble>
    </Box>
  );
};

export default ChatMessage;