import React from 'react';
import { Typography, Container } from '@mui/material';

const NotFound = () => {
   return (
     <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
       <Typography variant="h1" gutterBottom sx={{ fontSize: { xs: '4rem', md: '6rem' } }}>404</Typography>
       <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>Page Not Found</Typography>
       <Typography variant="body1" sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
         The page you're looking for doesn't exist or has been moved.
       </Typography>
     </Container>
   );
 };

export default NotFound;
