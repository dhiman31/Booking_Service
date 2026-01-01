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

    // cancel booking
    async cancelBooking (bookingId) {
        try {
            
            const response = await Booking.destroy({
                where : {
                    id : bookingId
                }
            })

            return response;

        } catch (error) {
            if(error.name === 'SequelizeValidationError'){
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot Cancel Booking',
                'There was some error cancelling the booking , please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    // modify booking
    async modifyBooking (bookingId,data) {
        try {
            // data must be such : {noOfSeats : .... , bookingId : ...}
            const {noOfSeats , totalCost} = data;
            const booking = await Booking.update(
                {noOfSeats,totalCost} ,
                {where: {id: bookingId }}
            );

            const updatedBooking = await Booking.findByPk(bookingId);
            return updatedBooking;

        } catch (error) {
            if(error.name === "SequelizeValidationError" || error.name === "ValidationError"){
                throw new ValidationError(error);
            }
            throw new AppError(
                'Problem in repo',
                'Could not modify booking',
                'Please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    }

    // get all bookings of a user
    async getAll (userId) {
        try {
            const booking = await Booking.findAll({
                where : {
                    userId : userId 
                }
            })
            return booking;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = BookingRepository;