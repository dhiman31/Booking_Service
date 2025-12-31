const express = require('express');
const { BookController } = require('../../controllers/index');
const router = express.Router();

router.post('/bookings',BookController.createBooking);

module.exports = router;