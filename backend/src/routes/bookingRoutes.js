const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/slots  -> List all slots
router.get('/slots', bookingController.getAvailableSlots);

// POST /api/book  -> Book a slot
router.post('/book', bookingController.createBooking);

module.exports = router;