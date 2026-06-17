import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

const InputContainer = styled(Box)(({ theme }) => ({
  padding: '12px 16px',
  borderTop: '1px solid rgba(47, 124, 123, 0.1)',
  background: 'rgba(248, 252, 253, 0.8)',
  backdropFilter: 'blur(10px)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '24px',
    background: 'rgba(255, 255, 255, 0.9)',
    '& fieldset': {
      borderColor: 'rgba(47, 124, 123, 0.2)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(47, 124, 123, 0.35)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2F7C7B',
    },
  },
}));

const SendButton = styled(IconButton)(({ theme, disabled }) => ({
  width: 42,
  height: 42,
  borderRadius: '50%',
  background: disabled
    ? 'rgba(47, 124, 123, 0.3)'
    : 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
  color: '#FFFFFF',
  '&:hover': {
    background: disabled
      ? 'rgba(47, 124, 123, 0.3)'
      : 'linear-gradient(135deg, #286665 0%, #6BB0B5 100%)',
  },
}));

const ChatInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <InputContainer>
      <Box display="flex" gap={1} alignItems="flex-end">
        <StyledTextField
          ref={inputRef}
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask anything..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          variant="outlined"
          size="small"
        />
        <SendButton
          disabled={disabled || !value.trim()}
          onClick={handleSubmit}
          aria-label="Send message"
        >
          <SendIcon fontSize="small" />
        </SendButton>
      </Box>
    </InputContainer>
  );
};

export default ChatInput;