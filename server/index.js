const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse incoming request bodies in JSON format
app.use(bodyParser.json());

// Define a route to proxy requests to the Twitter API
app.post('/api/blocks/create',cors(), async (req, res) => {
    const { screen_name } = req.body;
    const clientId = req.header('X-Client-ID');
    const clientSecret = req.header('X-Client-Secret');
    const tokenCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
    try {
      // Step 1: Get a bearer token
      const tokenResponse = await axios.post(
        'https://api.twitter.com/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${tokenCredentials}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          }
        }
      );
      
      const accessToken = tokenResponse.data.access_token;
  
      // Step 2: Use the bearer token to block the user
      const response = await axios.post(
        'https://api.twitter.com/1.1/blocks/create.json',
        { screen_name },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(error.response.status).json(error.response.data);
    }
  });
  
// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
