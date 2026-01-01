const { createBooking, cancelBooking , modifyBooking, getAllBookings} = require("./bookingController");

const BookController = {
    createBooking,
    cancelBooking,
    modifyBooking,
    getAllBookings
}

module.exports = {
    BookController
}