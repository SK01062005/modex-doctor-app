const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
const bookingRoutes = require('./src/routes/bookingRoutes'); // Import the routes
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// CRITICAL LINE: This tells the server to use your routes starting with /api
app.use('/api', bookingRoutes); 

// Test Route
app.get('/', async (req, res) => {
    res.json({ message: 'API is running...' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});