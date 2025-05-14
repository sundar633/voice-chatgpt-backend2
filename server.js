const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Your Cohere API Key from .env file
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Function to call Cohere API
async function makeApiRequest(userMessage) {
    try {
        const response = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                message: userMessage,
                model: 'command-r', // You can also try 'command-r-plus' if you have access
                temperature: 0.7,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${COHERE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.text;
    } catch (err) {
        console.error('❌ Error during Cohere API request:', err.response?.data || err.message);
        throw err;
    }
}

// Route for the frontend
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        console.log('🗣️ Message received:', userMessage);

        const reply = await makeApiRequest(userMessage);

        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: 'Cohere API request failed.' });
    }
});

// Start your server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
}); 
