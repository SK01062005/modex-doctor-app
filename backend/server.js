const express = require('express');
const cors = require('cors');
const pool = require('./src/config/db');
const bookingRoutes = require('./src/routes/bookingRoutes'); // Import Routes
require('dotenv').config();

const app = express();

app.use(express.json()); // Allow reading JSON body
app.use(cors());

// Use the routes
app.use('/api', bookingRoutes);

// Test Route
app.get('/', async (req, res) => {
    res.json({ message: 'API is running...' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});