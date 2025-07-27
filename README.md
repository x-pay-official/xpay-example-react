# X-Pay SDK React Example

This project demonstrates how to integrate the X-Pay cryptocurrency payment gateway SDK into a React application.

## Features

- Initialize the X-Pay SDK with your API credentials
- Create cryptocurrency collection orders
- Create cryptocurrency payout orders
- Display payment QR codes for customers
- Check payment status
- Get supported cryptocurrencies and chains
- Verify webhook signatures

## Prerequisites

- Node.js 14.x or higher
- npm or yarn

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Install the official X-Pay SDK:

```bash
npm install x-pay-sdk-official
```

## Configuration

To use this example with your X-Pay account, you'll need to:

1. Sign up for an X-Pay account at [x-pay.fun](https://x-pay.fun)
2. Obtain your API key and secret from the dashboard
3. Configure your credentials by creating a `.env` file from the provided `.env.example`:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit the .env file with your actual API credentials
   # REACT_APP_XPAY_API_KEY=your-actual-api-key
   # REACT_APP_XPAY_API_SECRET=your-actual-api-secret
   ```
   
   **IMPORTANT: Never commit your `.env` file to version control!**

## Running the Example

Start the development server:

```bash
npm start
```

Then open your browser to http://localhost:3001

## Project Structure

- `src/views/Home.js` - Landing page with SDK information
- `src/views/PaymentDemo.js` - Main demo page with SDK integration examples
- `src/components/PaymentQRCode.js` - Component for displaying payment QR codes
- `src/components/WebhookHandler.js` - Component for webhook verification demo
- `src/services/XPayService.js` - Service for interacting with the X-Pay API

## SDK Integration Steps

### 1. Create an XPayService

```javascript
// src/services/XPayService.js
import { XPaySDK } from 'x-pay-sdk-official';

class XPayService {
  constructor(config) {
    this.sdk = new XPaySDK({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      baseUrl: config.baseUrl || 'https://api.x-pay.fun'
    });
  }
  
  // API methods
  async createCollection(params) {
    return this.sdk.createCollection(params);
  }
  
  async createPayout(params) {
    return this.sdk.createPayout(params);
  }
  
  async getOrderStatus(orderId) {
    return this.sdk.getOrderStatus(orderId);
  }
  
  // More methods...
}
```

### 2. Initialize the Service

```javascript
import XPayService from '../services/XPayService';

// Initialize the service
const xpay = new XPayService({
  apiKey: process.env.REACT_APP_XPAY_API_KEY,
  apiSecret: process.env.REACT_APP_XPAY_API_SECRET,
  baseUrl: process.env.REACT_APP_XPAY_BASE_URL || 'https://api.x-pay.fun'
});
```

### 3. Create a Collection Order

```javascript
const response = await xpay.createCollection({
  amount: 100,
  symbol: 'USDT',
  chain: 'TRON',
  uid: 'user123',
  orderId: 'order-123456'
});

// The response contains the payment address and other details
console.log(response.data.address);
```

### 4. Check Order Status

```javascript
const status = await xpay.getOrderStatus('order-123456');
console.log(status);
```

### 5. Verify Webhooks

```javascript
// In your webhook handler
const isValid = xpay.verifyWebhook(
  JSON.stringify(webhookBody),
  signature,
  timestamp
);

if (isValid) {
  // Process the webhook
  const event = xpay.parseWebhook(JSON.stringify(webhookBody));
  console.log(event.notifyType, event.data);
}
```

## Environment Variables

This example uses environment variables to securely store API credentials. All configuration parameters are stored in a `.env` file that should never be committed to version control.

### Setting Up Environment Variables

1. Copy the example environment file to create your own:
   
   **For Windows:**
   ```cmd
   copy .env.example .env
   ```
   
   **For Linux/macOS:**
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual X-Pay API credentials:
   ```
   REACT_APP_XPAY_API_KEY=your-actual-api-key
   REACT_APP_XPAY_API_SECRET=your-actual-api-secret
   REACT_APP_XPAY_BASE_URL=https://api.x-pay.fun
   ```

3. Make sure `.env` is in your `.gitignore` file to prevent accidentally committing your credentials.

### Security Considerations

- **NEVER** commit your `.env` file to version control
- **NEVER** store API keys or secrets in public files
- **IMPORTANT**: For production applications, you should store your API secret on the backend server and implement a server-side API to handle the communication with the X-Pay API. The frontend should only communicate with your backend API, not directly with the X-Pay API.
- This example is for demonstration purposes only. In a real-world application, you should never expose your API secret in client-side code.

### How Environment Variables Are Loaded

This project uses `dotenv` to load environment variables from the `.env` file. The webpack configuration includes a `DefinePlugin` that makes these variables available to the React application through `process.env`.

### Accessing Environment Variables

In the React application, environment variables are accessed using `process.env.VARIABLE_NAME`:

```javascript
const apiKey = process.env.REACT_APP_XPAY_API_KEY;
const apiSecret = process.env.REACT_APP_XPAY_API_SECRET;
const baseUrl = process.env.REACT_APP_XPAY_BASE_URL || 'https://api.x-pay.fun';
```

## Production Considerations

When deploying to production:

1. **Never expose your API secret in client-side code**
   - For production applications, handle sensitive operations like signature generation on the server side
   - Use environment variables for configuration, but be aware that client-side environment variables are still visible in the browser

2. **Recommended Production Architecture:**
   - Frontend (React): Handles UI and user interactions
   - Backend (Node.js, Python, etc.): Stores API credentials securely and communicates with X-Pay API
   - API Flow: Frontend → Your Backend → X-Pay API

3. Implement proper error handling and retry mechanisms
4. Set up webhook verification to securely receive payment notifications
5. Consider implementing rate limiting and request validation

## License

This example project is MIT licensed.