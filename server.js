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

// Load all API keys from environment
const apiKeys = process.env.COHERE_KEYS.split(',');
let currentKeyIndex = 0;

// Function to get next API key in round-robin
function getNextApiKey() {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
}

// Function to call Cohere API
async function makeApiRequest(userMessage) {
    try {
        const apiKey = getNextApiKey();

        const response = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                message: userMessage,
                model: 'command-r',
                temperature: 0.7,
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
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

// Route for frontend
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
