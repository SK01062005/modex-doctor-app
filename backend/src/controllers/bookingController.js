const bookingService = require('../services/bookingService');

const getAvailableSlots = async (req, res) => {
    try {
        const slots = await bookingService.getSlots();
        res.json(slots);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createBooking = async (req, res) => {
    const { userId, slotId } = req.body;
    try {
        const booking = await bookingService.bookSlot(userId, slotId);
        res.json({ message: 'Booking Confirmed!', booking });
    } catch (err) {
        // If error is "Slot is already booked", send 409 Conflict
        if (err.message === 'Slot is already booked') {
            res.status(409).json({ error: err.message });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = { getAvailableSlots, createBooking };