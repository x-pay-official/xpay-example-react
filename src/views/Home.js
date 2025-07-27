import React from 'react';
import { Typography, Paper, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to X-Pay SDK React Example
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          About X-Pay
        </Typography>
        <Typography paragraph>
          X-Pay is a cryptocurrency payment gateway that allows businesses to accept various cryptocurrencies
          as payment. This example demonstrates how to integrate the X-Pay SDK into a React application.
        </Typography>
        <Typography paragraph>
          The X-Pay SDK provides a simple way to create payment orders, check payment status, and verify
          webhook signatures.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          to="/payment-demo"
          sx={{ mt: 2 }}
        >
          Try the Demo
        </Button>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Getting Started
        </Typography>
        <Typography paragraph>
          To use this example with your X-Pay account, you'll need to:
        </Typography>
        <ol>
          <li>
            <Typography>
              Sign up for an X-Pay account at <a href="https://x-pay.fun" target="_blank" rel="noopener noreferrer">x-pay.fun</a>
            </Typography>
          </li>
          <li>
            <Typography>
              Obtain your API key and secret from the dashboard
            </Typography>
          </li>
          <li>
            <Typography>
              Configure your credentials in the .env file
            </Typography>
          </li>
        </ol>
        <Typography variant="h6" component="h3" sx={{ mt: 2 }}>
          Environment Variables
        </Typography>
        <Typography component="pre" sx={{ 
          bgcolor: '#f5f5f5', 
          p: 2, 
          borderRadius: 1,
          overflow: 'auto',
          fontFamily: 'monospace'
        }}>
          {`# Create a .env file in the project root
# Never commit this file to version control!

REACT_APP_XPAY_API_KEY=your-api-key
REACT_APP_XPAY_API_SECRET=your-api-secret
REACT_APP_XPAY_BASE_URL=https://api.x-pay.fun`}
        </Typography>
      </Paper>
    </Box>
  );
}

export default Home;