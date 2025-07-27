import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import QRCode from 'qrcode';

const PaymentQRCode = ({ paymentData, onExpired }) => {
  const qrCanvasRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (paymentData && paymentData.expiredTime) {
      // expiredTime is already in milliseconds from the PaymentDemo component
      startTimer(paymentData.expiredTime);
    }
    
    return () => stopTimer();
  }, [paymentData]);

  useEffect(() => {
    if (paymentData && !isPayoutOrder() && qrCanvasRef.current) {
      generateQRCode();
    }
  }, [paymentData, qrCanvasRef.current]);

  const isPayoutOrder = () => {
    return paymentData?.orderType === 'PAYOUT';
  };

  const generateQRCode = () => {
    if (!paymentData || !paymentData.address) return;
    
    let qrContent = '';
    
    // For crypto payments, include the full payment information
    if (paymentData.chain === 'TRON') {
      // TRON TRC20 format
      qrContent = `tron:${paymentData.address}?token=${paymentData.symbol}&amount=${paymentData.amount}`;
    } else if (paymentData.chain === 'ETH') {
      // Ethereum format
      qrContent = `ethereum:${paymentData.address}@1?value=${paymentData.amount}&symbol=${paymentData.symbol}`;
    } else if (paymentData.chain === 'BSC') {
      // BSC format
      qrContent = `binance:${paymentData.address}?amount=${paymentData.amount}&token=${paymentData.symbol}`;
    } else {
      // Generic format
      qrContent = `${paymentData.address}`;
    }
    
    QRCode.toCanvas(qrCanvasRef.current, qrContent, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).catch(err => {
      console.error('Error generating QR code:', err);
    });
  };

  const startTimer = (expiryTime) => {
    stopTimer();
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        stopTimer();
        if (onExpired) onExpired();
      }
    };
    
    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Address copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const truncateTxid = (txid) => {
    if (!txid) return '';
    if (txid.length <= 16) return txid;
    return txid.substring(0, 8) + '...' + txid.substring(txid.length - 8);
  };

  const getStatusClass = () => {
    if (!paymentData) return '';
    
    const status = paymentData.status;
    
    if (['PENDING', 'PENDING_CONFIRMATION'].includes(status)) {
      return 'status-pending';
    } else if (status === 'SUCCESS') {
      return 'status-success';
    } else if (['EXPIRED', 'FAILED'].includes(status)) {
      return 'status-failed';
    } else {
      return '';
    }
  };

  const getTitle = () => {
    if (!paymentData) return 'Payment Details';
    
    if (isPayoutOrder()) {
      return 'Merchant Payout Details';
    } else {
      return 'Scan to Pay';
    }
  };

  const getDisplayStatus = () => {
    if (!paymentData) return '';
    
    const status = paymentData.status;
    const isPayout = isPayoutOrder();
    
    if (status === 'PENDING') {
      return isPayout ? 'Processing Payout' : 'Awaiting Payment';
    } else if (status === 'PENDING_CONFIRMATION') {
      return isPayout ? 'Confirming Payout' : 'Confirming Payment';
    } else if (status === 'SUCCESS') {
      return isPayout ? 'Funds Sent Successfully' : 'Payment Successful';
    } else if (status === 'EXPIRED') {
      return isPayout ? 'Payout Request Expired' : 'Payment Window Expired';
    } else if (status === 'FAILED') {
      return isPayout ? 'Payout Failed' : 'Payment Failed';
    } else {
      return status || 'Unknown';
    }
  };

  if (!paymentData) {
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No payment data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h5" component="h2" align="center" gutterBottom>
        {getTitle()}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {isPayoutOrder() ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 200
            }}>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'white',
                fontSize: '3rem'
              }}>
                →
              </Box>
              <Typography sx={{ mt: 1, fontWeight: 'bold' }}>
                Merchant to User
              </Typography>
            </Box>
          ) : (
            <Box sx={{ 
              bgcolor: 'white', 
              p: 2, 
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <canvas ref={qrCanvasRef} width="200" height="200" />
            </Box>
          )}
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', width: 80, color: 'text.secondary' }}>
                Amount:
              </Typography>
              <Typography>
                {paymentData.amount} {paymentData.symbol}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', width: 80, color: 'text.secondary' }}>
                {isPayoutOrder() ? 'To:' : 'Address:'}
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'monospace', 
                  bgcolor: '#f5f5f5', 
                  p: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.9rem',
                  flex: 1,
                  wordBreak: 'break-all'
                }}
              >
                {paymentData.address}
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                color="secondary" 
                sx={{ ml: 1, minWidth: 'auto' }}
                onClick={() => copyToClipboard(paymentData.address)}
              >
                Copy
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', width: 80, color: 'text.secondary' }}>
                Network:
              </Typography>
              <Typography>
                {paymentData.chain}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ fontWeight: 'bold', width: 80, color: 'text.secondary' }}>
                Status:
              </Typography>
              <Typography 
                sx={{ 
                  fontWeight: 'bold',
                  color: getStatusClass() === 'status-pending' ? 'warning.main' : 
                         getStatusClass() === 'status-success' ? 'success.main' : 
                         getStatusClass() === 'status-failed' ? 'error.main' : 'text.primary'
                }}
              >
                {getDisplayStatus()}
              </Typography>
            </Box>
            
            {paymentData.txid && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 'bold', width: 80, color: 'text.secondary' }}>
                  TX ID:
                </Typography>
                <Typography 
                  sx={{ 
                    fontFamily: 'monospace', 
                    bgcolor: '#f5f5f5', 
                    p: 0.5, 
                    borderRadius: 1,
                    fontSize: '0.9rem',
                    flex: 1
                  }}
                >
                  {truncateTxid(paymentData.txid)}
                </Typography>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="secondary" 
                  sx={{ ml: 1, minWidth: 'auto' }}
                  onClick={() => copyToClipboard(paymentData.txid)}
                >
                  Copy
                </Button>
              </Box>
            )}
            
            {timeRemaining > 0 && (
              <Box sx={{ 
                mt: 2, 
                textAlign: 'center', 
                fontWeight: 'bold',
                color: 'error.main'
              }}>
                <Typography>
                  Expires in: {formatTime(timeRemaining)}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PaymentQRCode;