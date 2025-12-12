const pool = require('../config/db');

const bookSlot = async (userId, slotId) => {
    const client = await pool.connect(); // Get a dedicated client for transaction

    try {
        await client.query('BEGIN'); // 1. Start Transaction

        // 2. LOCK the slot row.
        // "FOR UPDATE" means: "I am reading this row to update it. No one else can touch it."
        const slotCheck = await client.query(
            'SELECT * FROM slots WHERE id = $1 FOR UPDATE',
            [slotId]
        );

        if (slotCheck.rows.length === 0) {
            throw new Error('Slot not found');
        }

        const slot = slotCheck.rows[0];

        // 3. Check if already booked
        if (slot.status === 'BOOKED' || slot.status === 'LOCKED') {
            throw new Error('Slot is already booked');
        }

        // 4. Create the Booking
        const bookingResult = await client.query(
            'INSERT INTO bookings (user_id, slot_id, status) VALUES ($1, $2, $3) RETURNING *',
            [userId, slotId, 'CONFIRMED']
        );

        // 5. Update Slot Status to BOOKED
        await client.query(
            'UPDATE slots SET status = $1 WHERE id = $2',
            ['BOOKED', slotId]
        );

        await client.query('COMMIT'); // 6. Save changes
        return bookingResult.rows[0];

    } catch (error) {
        await client.query('ROLLBACK'); // If anything fails, undo changes
        throw error;
    } finally {
        client.release(); // Release the client back to the pool
    }
};

const getSlots = async () => {
    // Join with Doctors to get the doctor's name
    const result = await pool.query(`
        SELECT slots.id, slots.start_time, slots.status, doctors.name as doctor_name, doctors.specialization 
        FROM slots 
        JOIN doctors ON slots.doctor_id = doctors.id 
        ORDER BY slots.start_time
    `);
    return result.rows;
};

module.exports = { bookSlot, getSlots };