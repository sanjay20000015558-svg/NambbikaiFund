import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ message, action, onAction }) => {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message || 'No items found'}
      </Typography>
      {action && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 2 }}>
          {action}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
