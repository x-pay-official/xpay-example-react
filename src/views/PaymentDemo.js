import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tabs,
  Tab,
  Alert,
  Divider
} from '@mui/material';
import PaymentQRCode from '../components/PaymentQRCode';
import WebhookHandler from '../components/WebhookHandler';
import XPayService from '../services/XPayService';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PaymentDemo() {
  const [xpay, setXpay] = useState(null);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [orderTab, setOrderTab] = useState(0);
  
  const [collectionOrder, setCollectionOrder] = useState({
    amount: 100,
    symbol: 'USDT',
    chain: 'TRON',
    uid: 'user123',
    orderId: ''
  });
  
  const [payoutOrder, setPayoutOrder] = useState({
    amount: 100,
    symbol: 'USDT',
    chain: 'TRON',
    uid: 'user123',
    receiveAddress: '',
    orderId: ''
  });
  
  const [checkOrderId, setCheckOrderId] = useState('');
  const [symbolFilter, setSymbolFilter] = useState('');
  const [chainFilter, setChainFilter] = useState('');
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState(null);

  useEffect(() => {
    // Initialize SDK automatically on component mount
    initializeSDK();
    
    return () => {
      stopStatusCheck();
    };
  }, []);

  const initializeSDK = () => {
    try {
      // Get API credentials from .env file through process.env
      const apiKey = process.env.REACT_APP_XPAY_API_KEY;
      const apiSecret = process.env.REACT_APP_XPAY_API_SECRET;
      const baseUrl = process.env.REACT_APP_XPAY_BASE_URL || 'https://api.x-pay.fun';
      
      if (!apiKey || !apiSecret) {
        throw new Error('API key or secret not found in environment variables');
      }
      
      const xpayInstance = new XPayService({
        apiKey,
        apiSecret,
        baseUrl
      });
      
      setXpay(xpayInstance);
      setSdkInitialized(true);
      setError(null);
    } catch (err) {
      setError(`Failed to initialize SDK: ${err.message}`);
      setSdkInitialized(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOrderTabChange = (event, newValue) => {
    setOrderTab(newValue);
  };

  const handleCollectionOrderChange = (field) => (event) => {
    setCollectionOrder({
      ...collectionOrder,
      [field]: event.target.value
    });
  };

  const handlePayoutOrderChange = (field) => (event) => {
    setPayoutOrder({
      ...payoutOrder,
      [field]: event.target.value
    });
  };

  const generateOrderId = () => {
    setCollectionOrder({
      ...collectionOrder,
      orderId: `order-${Date.now()}`
    });
  };

  const generatePayoutOrderId = () => {
    setPayoutOrder({
      ...payoutOrder,
      orderId: `payout-${Date.now()}`
    });
  };

  const createCollectionOrder = async () => {
    if (!sdkInitialized) {
      setError('SDK not initialized. Please check your API credentials.');
      return;
    }
    
    if (!collectionOrder.uid) {
      setError('User ID is required for collection orders.');
      return;
    }
    
    // Prevent duplicate API calls
    const buttonElement = document.activeElement;
    if (buttonElement) buttonElement.disabled = true;
    
    try {
      setError(null);
      setResult(null);
      setPaymentData(null);
      stopStatusCheck();
      
      const response = await xpay.createCollection({
        amount: collectionOrder.amount,
        symbol: collectionOrder.symbol,
        chain: collectionOrder.chain,
        uid: collectionOrder.uid,
        orderId: collectionOrder.orderId || ''
      });
      
      setResult(response);
      setCheckOrderId(collectionOrder.orderId || response.data.orderId);
      
      // Create payment data for QR code
      if (response && response.data) {
        setPaymentData({
          amount: collectionOrder.amount,
          symbol: collectionOrder.symbol,
          chain: collectionOrder.chain,
          address: response.data.address,
          status: 'PENDING',
          orderType: 'COLLECTION',
          expiredTime: response.data.expiredTime * 1000 // Convert to milliseconds
        });
        
        // Start checking status periodically
        startStatusCheck(response.data.orderId);
      }
    } catch (err) {
      setError(`Failed to create collection order: ${err.message}`);
    } finally {
      // Re-enable the button
      if (buttonElement) buttonElement.disabled = false;
    }
  };

  const createPayoutOrder = async () => {
    if (!sdkInitialized) {
      setError('SDK not initialized. Please check your API credentials.');
      return;
    }
    
    if (!payoutOrder.uid) {
      setError('User ID is required for payout orders.');
      return;
    }
    
    if (!payoutOrder.receiveAddress) {
      setError('Receive address is required for payout orders.');
      return;
    }
    
    // Prevent duplicate API calls
    const buttonElement = document.activeElement;
    if (buttonElement) buttonElement.disabled = true;
    
    try {
      setError(null);
      setResult(null);
      setPaymentData(null);
      stopStatusCheck();
      
      const response = await xpay.createPayout({
        amount: payoutOrder.amount,
        symbol: payoutOrder.symbol,
        chain: payoutOrder.chain,
        uid: payoutOrder.uid,
        receiveAddress: payoutOrder.receiveAddress,
        orderId: payoutOrder.orderId || ''
      });
      
      setResult(response);
      setCheckOrderId(payoutOrder.orderId || response.data.orderId);
      
      // Create payment data for QR code
      if (response && response.data) {
        setPaymentData({
          amount: payoutOrder.amount,
          symbol: payoutOrder.symbol,
          chain: payoutOrder.chain,
          address: payoutOrder.receiveAddress,
          status: response.data.status || 'PENDING',
          orderType: 'PAYOUT',
          orderId: response.data.orderId
        });
      }
    } catch (err) {
      setError(`Failed to create payout order: ${err.message}`);
    } finally {
      // Re-enable the button
      if (buttonElement) buttonElement.disabled = false;
    }
  };

  const checkOrderStatus = async () => {
    if (!sdkInitialized) {
      setError('SDK not initialized. Please check your API credentials.');
      return;
    }
    
    if (!checkOrderId) {
      setError('Please enter an Order ID to check.');
      return;
    }
    
    // Prevent duplicate API calls
    const buttonElement = document.activeElement;
    if (buttonElement) buttonElement.disabled = true;
    
    try {
      setError(null);
      setResult(null);
      
      const response = await xpay.getOrderStatus(checkOrderId);
      setResult(response);
      
      // Update payment data if we're displaying it
      if (paymentData && response.data && response.data.orderId === checkOrderId) {
        setPaymentData({
          ...paymentData,
          status: response.data.status,
          txid: response.data.txid
        });
      }
    } catch (err) {
      setError(`Failed to check order status: ${err.message}`);
    } finally {
      // Re-enable the button
      if (buttonElement) buttonElement.disabled = false;
    }
  };

  const getSupportedSymbols = async () => {
    if (!sdkInitialized) {
      setError('SDK not initialized. Please check your API credentials.');
      return;
    }
    
    // Prevent duplicate API calls
    const buttonElement = document.activeElement;
    if (buttonElement) buttonElement.disabled = true;
    
    try {
      setError(null);
      setResult(null);
      
      const response = await xpay.getSupportedSymbols(
        chainFilter || undefined,
        symbolFilter || undefined
      );
      setResult(response);
    } catch (err) {
      setError(`Failed to get supported symbols: ${err.message}`);
    } finally {
      // Re-enable the button
      if (buttonElement) buttonElement.disabled = false;
    }
  };

  const startStatusCheck = (orderId) => {
    stopStatusCheck();
    
    // Check status every 10 seconds
    const interval = setInterval(async () => {
      if (orderId) {
        try {
          const response = await xpay.getOrderStatus(orderId);
          
          // Update payment data with new status
          if (paymentData && response.data) {
            setPaymentData(prevData => ({
              ...prevData,
              status: response.data.status || prevData.status,
              txid: response.data.txid
            }));
            
            // If payment is completed or failed, stop checking
            if (['SUCCESS', 'EXPIRED', 'FAILED'].includes(response.data.status)) {
              stopStatusCheck();
            }
          }
        } catch (err) {
          console.error('Error checking status:', err);
        }
      }
    }, 10000);
    
    setStatusCheckInterval(interval);
  };

  const stopStatusCheck = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  const handlePaymentExpired = () => {
    if (paymentData) {
      setPaymentData({
        ...paymentData,
        status: 'EXPIRED'
      });
    }
    stopStatusCheck();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        X-Pay Payment Integration Demo
      </Typography>
      
      {sdkInitialized ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          SDK initialized successfully with API credentials from environment variables
        </Alert>
      ) : (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Failed to initialize SDK. Missing API credentials.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please create a <code>.env</code> file in the project root with your API credentials:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              mt: 1, 
              borderRadius: 1,
              fontSize: '0.8rem',
              overflowX: 'auto'
            }}
          >
            REACT_APP_XPAY_API_KEY=your-api-key
            REACT_APP_XPAY_API_SECRET=your-api-secret
            REACT_APP_XPAY_BASE_URL=https://api.x-pay.fun
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You can copy the <code>.env.example</code> file to <code>.env</code> and update the values.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'error.main', fontWeight: 'bold' }}>
            IMPORTANT: Never commit your .env file to version control!
          </Typography>
        </Alert>
      )}
      
      {paymentData && (
        <PaymentQRCode 
          paymentData={paymentData}
          onExpired={handlePaymentExpired}
        />
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="demo tabs">
          <Tab label="Payment Demo" />
          <Tab label="Webhook Demo" />
        </Tabs>
      </Box>
      
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={orderTab} onChange={handleOrderTabChange} aria-label="order type tabs">
            <Tab label="Collection Order" />
            <Tab label="Payout Order" />
          </Tabs>
        </Box>
        
        <TabPanel value={orderTab} index={0}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4,
              opacity: sdkInitialized ? 1 : 0.6,
              pointerEvents: sdkInitialized ? 'auto' : 'none'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Create Collection Order
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount"
                  type="number"
                  value={collectionOrder.amount}
                  onChange={handleCollectionOrderChange('amount')}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="collection-symbol-label">Symbol</InputLabel>
                  <Select
                    labelId="collection-symbol-label"
                    value={collectionOrder.symbol}
                    label="Symbol"
                    onChange={handleCollectionOrderChange('symbol')}
                  >
                    <MenuItem value="USDT">USDT</MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="collection-chain-label">Chain</InputLabel>
                  <Select
                    labelId="collection-chain-label"
                    value={collectionOrder.chain}
                    label="Chain"
                    onChange={handleCollectionOrderChange('chain')}
                  >
                    
                    <MenuItem value="TRON">TRON</MenuItem>
                    <MenuItem value="ETH">Ethereum</MenuItem>
                    <MenuItem value="BSC">Binance Smart Chain</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="User ID"
                  value={collectionOrder.uid}
                  onChange={handleCollectionOrderChange('uid')}
                  fullWidth
                  margin="normal"
                  placeholder="User ID (required)"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Order ID"
                    value={collectionOrder.orderId}
                    onChange={handleCollectionOrderChange('orderId')}
                    fullWidth
                    margin="normal"
                    placeholder="Order ID (optional)"
                  />
                  <Button 
                    variant="outlined" 
                    onClick={generateOrderId}
                    sx={{ mt: 1, height: 40 }}
                  >
                    Generate
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={createCollectionOrder}
              sx={{ mt: 2 }}
              fullWidth
            >
              Create Collection Order
            </Button>
          </Paper>
        </TabPanel>
        
        <TabPanel value={orderTab} index={1}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4,
              opacity: sdkInitialized ? 1 : 0.6,
              pointerEvents: sdkInitialized ? 'auto' : 'none'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Create Payout Order
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount"
                  type="number"
                  value={payoutOrder.amount}
                  onChange={handlePayoutOrderChange('amount')}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="payout-symbol-label">Symbol</InputLabel>
                  <Select
                    labelId="payout-symbol-label"
                    value={payoutOrder.symbol}
                    label="Symbol"
                    onChange={handlePayoutOrderChange('symbol')}
                  >
                    <MenuItem value="USDT">USDT</MenuItem>
                    <MenuItem value="ETH">ETH</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="payout-chain-label">Chain</InputLabel>
                  <Select
                    labelId="payout-chain-label"
                    value={payoutOrder.chain}
                    label="Chain"
                    onChange={handlePayoutOrderChange('chain')}
                  >
                    
                    <MenuItem value="TRON">TRON</MenuItem>
                    <MenuItem value="ETH">Ethereum</MenuItem>
                    <MenuItem value="BSC">Binance Smart Chain</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="User ID"
                  value={payoutOrder.uid}
                  onChange={handlePayoutOrderChange('uid')}
                  fullWidth
                  margin="normal"
                  placeholder="User ID (required)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Receive Address"
                  value={payoutOrder.receiveAddress}
                  onChange={handlePayoutOrderChange('receiveAddress')}
                  fullWidth
                  margin="normal"
                  placeholder="Blockchain Address"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Order ID"
                    value={payoutOrder.orderId}
                    onChange={handlePayoutOrderChange('orderId')}
                    fullWidth
                    margin="normal"
                    placeholder="Order ID (optional)"
                  />
                  <Button 
                    variant="outlined" 
                    onClick={generatePayoutOrderId}
                    sx={{ mt: 1, height: 40 }}
                  >
                    Generate
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            <Button 
              variant="contained" 
              color="primary" 
              onClick={createPayoutOrder}
              sx={{ mt: 2 }}
              fullWidth
            >
              Create Payout Order
            </Button>
          </Paper>
        </TabPanel>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4,
            opacity: sdkInitialized ? 1 : 0.6,
            pointerEvents: sdkInitialized ? 'auto' : 'none'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Check Order Status
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="Order ID"
              value={checkOrderId}
              onChange={(e) => setCheckOrderId(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="Order ID to check"
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={checkOrderStatus}
              sx={{ mt: 1, height: 40 }}
            >
              Check Status
            </Button>
          </Box>
        </Paper>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3,
            opacity: sdkInitialized ? 1 : 0.6,
            pointerEvents: sdkInitialized ? 'auto' : 'none'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Get Supported Symbols
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Symbol Filter (optional)"
                value={symbolFilter}
                onChange={(e) => setSymbolFilter(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Filter by symbol"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Chain Filter (optional)"
                value={chainFilter}
                onChange={(e) => setChainFilter(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="Filter by chain"
              />
            </Grid>
          </Grid>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={getSupportedSymbols}
            sx={{ mt: 2 }}
            fullWidth
          >
            Get Symbols
          </Button>
        </Paper>
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <WebhookHandler 
          xpay={xpay} 
          sdkInitialized={sdkInitialized}
        />
      </TabPanel>
      
      {result && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Result
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#2c3e50', 
              color: '#fff', 
              p: 2, 
              borderRadius: 1,
              overflowX: 'auto'
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Paper>
      )}
      
      {error && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#ffebee' }}>
          <Typography variant="h6" gutterBottom color="error">
            Error
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              bgcolor: '#e74c3c', 
              color: '#fff', 
              p: 2, 
              borderRadius: 1,
              overflowX: 'auto'
            }}
          >
            {error}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default PaymentDemo;