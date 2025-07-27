import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert
} from '@mui/material';

const WebhookHandler = ({ xpay, sdkInitialized }) => {
  const [webhookBody, setWebhookBody] = useState(JSON.stringify({
    notifyType: "ORDER_STATUS_CHANGE",
    data: {
      orderId: "order-123456789",
      status: "SUCCESS",
      txid: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    }
  }, null, 2));
  
  const [signature, setSignature] = useState('mock_signature_for_testing');
  const [timestamp, setTimestamp] = useState(Date.now().toString());
  const [verificationResult, setVerificationResult] = useState(null);
  const [parsedWebhook, setParsedWebhook] = useState(null);
  const [notifyType, setNotifyType] = useState('ORDER_STATUS_CHANGE');

  const handleNotifyTypeChange = (event) => {
    const type = event.target.value;
    setNotifyType(type);
    
    let sampleData = {};
    
    switch (type) {
      case 'ORDER_STATUS_CHANGE':
        sampleData = {
          orderId: "order-123456789",
          status: "SUCCESS",
          txid: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        break;
      case 'PAYMENT_RECEIVED':
        sampleData = {
          orderId: "order-123456789",
          amount: "100",
          symbol: "USDT",
          txid: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        break;
      case 'PAYOUT_COMPLETED':
        sampleData = {
          orderId: "payout-123456789",
          status: "SUCCESS",
          txid: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
        };
        break;
      default:
        sampleData = {
          orderId: "order-123456789"
        };
    }
    
    setWebhookBody(JSON.stringify({
      notifyType: type,
      data: sampleData
    }, null, 2));
  };

  const handleVerifyWebhook = () => {
    if (!sdkInitialized) {
      setVerificationResult({
        success: false,
        message: 'SDK not initialized. Please check your API credentials.'
      });
      return;
    }
    
    try {
      const isValid = xpay.verifyWebhook(webhookBody, signature, timestamp);
      
      setVerificationResult({
        success: isValid,
        message: isValid ? 'Webhook signature is valid!' : 'Invalid webhook signature!'
      });
      
      if (isValid) {
        const parsed = xpay.parseWebhook(webhookBody);
        setParsedWebhook(parsed);
      } else {
        setParsedWebhook(null);
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: `Error verifying webhook: ${error.message}`
      });
      setParsedWebhook(null);
    }
  };

  const generateNewTimestamp = () => {
    setTimestamp(Date.now().toString());
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Webhook Verification Demo
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography paragraph>
          This demo shows how to verify webhook signatures from X-Pay. In a real application,
          you would receive these webhooks at your server endpoint.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="notify-type-label">Notification Type</InputLabel>
              <Select
                labelId="notify-type-label"
                id="notify-type"
                value={notifyType}
                label="Notification Type"
                onChange={handleNotifyTypeChange}
                disabled={!sdkInitialized}
              >
                <MenuItem value="ORDER_STATUS_CHANGE">Order Status Change</MenuItem>
                <MenuItem value="PAYMENT_RECEIVED">Payment Received</MenuItem>
                <MenuItem value="PAYOUT_COMPLETED">Payout Completed</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Webhook Body (JSON)"
              multiline
              rows={10}
              value={webhookBody}
              onChange={(e) => setWebhookBody(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ mb: 3 }}
              disabled={!sdkInitialized}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 3 }}
                  disabled={!sdkInitialized}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Timestamp"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 3 }}
                    disabled={!sdkInitialized}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={generateNewTimestamp}
                    sx={{ mb: 3 }}
                    disabled={!sdkInitialized}
                  >
                    New
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleVerifyWebhook}
              disabled={!sdkInitialized}
              fullWidth
            >
              Verify Webhook
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Verification Result
            </Typography>
            
            {verificationResult && (
              <Alert 
                severity={verificationResult.success ? "success" : "error"}
                sx={{ mb: 3 }}
              >
                {verificationResult.message}
              </Alert>
            )}
            
            {parsedWebhook && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Parsed Webhook Data:
                </Typography>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                  }}
                >
                  {JSON.stringify(parsedWebhook, null, 2)}
                </Paper>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Implementation Guide
              </Typography>
              <Typography variant="body2" component="div">
                <ol>
                  <li>Set up an endpoint on your server to receive webhooks</li>
                  <li>Extract the X-SIGNATURE and X-TIMESTAMP headers from the request</li>
                  <li>Verify the signature using the XPay SDK:</li>
                  <Box 
                    component="pre" 
                    sx={{ 
                      bgcolor: '#f5f5f5', 
                      p: 2, 
                      borderRadius: 1,
                      overflowX: 'auto',
                      fontSize: '0.8rem'
                    }}
                  >
{`const isValid = xpay.verifyWebhook(
  JSON.stringify(req.body),
  req.headers['x-signature'],
  req.headers['x-timestamp']
);

if (isValid) {
  // Process the webhook
  const event = xpay.parseWebhook(JSON.stringify(req.body));
  console.log(event.notifyType, event.data);
}`}
                  </Box>
                </ol>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default WebhookHandler;