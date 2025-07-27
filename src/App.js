import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import Home from './views/Home';
import PaymentDemo from './views/PaymentDemo';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            X-Pay React Example
          </Typography>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/payment-demo">Payment Demo</Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/payment-demo" element={<PaymentDemo />} />
        </Routes>
      </Container>
      
      <Box component="footer" sx={{ mt: 8, py: 3, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          X-Pay SDK React Example © {new Date().getFullYear()}
        </Typography>
      </Box>
    </div>
  );
}

export default App;