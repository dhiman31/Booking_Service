const express = require('express');
const { BookController } = require('../../controllers/index');
const router = express.Router();

router.post('/booking',BookController.createBooking);
router.delete('/bookings/:id',BookController.cancelBooking);
router.patch('/bookings/:id',BookController.modifyBooking);
router.get('/bookings/user/:id',BookController.getAllBookings);

module.exports = router;