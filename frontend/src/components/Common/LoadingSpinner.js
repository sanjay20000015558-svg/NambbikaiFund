import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="rgba(255, 255, 255, 0.8)"
      zIndex={9999}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {text}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
