const { StatusCodes } = require('http-status-codes');
const {Booking} = require('../models/index')
const {AppError , ValidationError} = require('../utils/index')

class BookingRepository {

    async createBooking(data){
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if(error.name === 'SequelizeValidationError'){
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot Create Booking',
                'There was some error creating the booking , please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    async updateBooking(bookingId,data){
        try {
            
            const booking = await Booking.findByPk(bookingId);
            if(data.status) {
            booking.status = data.status;
            };
            await booking.save();
            return booking;

        } catch (error) {
            if(error.name === 'SequelizeValidationError'){
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot Update Booking',
                'There was some error updating the booking , please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }
}

module.exports = BookingRepository;