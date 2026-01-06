const {BookingRepository} = require('../repository/index');
const { ServiceError, ValidationError, AppError } = require('../utils');
const axios = require('axios');
const {Booking} = require('../models/index');
const {FLIGHT_SERVICE_PATH} = require('../config/serverConfig');
const { StatusCodes } = require('http-status-codes');
const { publishMessage } = require('../utils/messageQueue');

class BookingService {
    constructor(){
        this.BookingRepository = new BookingRepository();
    }

    // book booking
    async createBooking (data) {
        try {

            // parallel requests can also be sent by promise.all

            const { userId, flightId, noOfSeats } = data;
            const getFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const getResponse = await axios.get(getFlightRequestUrl);
            const flightData = getResponse.data.data;
            let priceOfFlight = flightData.price;
            if(data.noOfSeats > flightData.totalSeats){
                throw new ServiceError(
                    'Something went wrong in booking process',
                    'Insufficient seats in the flight'
                )
            }
            const totalCost = data.noOfSeats * priceOfFlight;
            const booking = await this.BookingRepository.createBooking({
                userId,
                flightId,
                noOfSeats,
                totalCost,
                status: 'InProcess'
                });
            const updateFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await axios.patch(updateFlightRequestUrl,{totalSeats:flightData.totalSeats-data.noOfSeats});
            const finalBooking = await this.BookingRepository.updateBooking(booking.id,{ status: 'Booked' });

            const departureTime = new Date(flightData.departureTime);
            const notificationTime = new Date(
            departureTime.getTime() - 24 * 60 * 60 * 1000
            );

             await publishMessage('booking.confirmed',
                // message
                {
                    bookingId: booking.id,
                    recepientEmail: 'ankushiiituna@gmail.com',        // from request body
                    subject: `Booking Confirmed`,
                    content: `Your booking for flight ${flightData.flightNumber} is confirmed.`,
                    notificationTime: notificationTime
                });

            return finalBooking
            
        } catch (error) {
            if(error.name === 'RepositoryError' || error.name === 'ValidationError'){
                throw error;
            }
            throw new ServiceError();
        }
    }

    // cancel booking
    async cancelBooking (id) {
        try {
            
            const booking = await Booking.findByPk(id);
            const flightId = booking.flightId;
            const noOfSeats = booking.noOfSeats;
            // cost is not managed in the scope of this project

            const getFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const getResponse = await axios.get(getFlightRequestUrl);
            const flightData = getResponse.data.data;
            
            const updateFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await axios.patch(updateFlightRequestUrl,{totalSeats:flightData.totalSeats + noOfSeats});

            await this.BookingRepository.cancelBooking(id);
            
            return {
                bookingId : id,
                noOfSeats : booking.noOfSeats,
                flightId : booking.flightId,
                departureAirportId : flightData.departureAirportId,
                arrivalAirportId : flightData.arrivalAirportId,
                status : 'Cancelled'
            }

        } catch (error) {
            if(error.name === 'RepositoryError' || error.name === 'ValidationError'){
                throw error;
            }
            throw new ServiceError();
        }
    }

    // modify booking
    async modifyBooking (bookingId,data) {
        // data must contain the booking id and seat change info (+2 or -2)
        // we need to extract the booking object by id
        const seatChange = Number(data.seatChange);
        if (isNaN(seatChange)) {
            throw new AppError(
                'BookingModifyError',
                'Invalid seatChange',
                'seatChange must be a number',
                StatusCodes.BAD_REQUEST
            );
        }

        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            throw new AppError(
                'BookingNotFound',
                'Invalid Booking ID',
                'No booking found with this ID',
                StatusCodes.NOT_FOUND
            );
        }

        const flightId = booking.flightId;
        const getFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
        const getResponse = await axios.get(getFlightRequestUrl);
        const flightData = getResponse.data.data;

        if(seatChange<0 &&  Math.abs(seatChange) > booking.noOfSeats){
            throw new AppError(
                'BookingModifyError',
                'InvalidRequest',
                'Request to cancell more tickets than booked',
                StatusCodes.BAD_REQUEST
            )
        }

        const noOfSeats = booking.noOfSeats + seatChange; 
        const totalCost = noOfSeats * flightData.price;

        const finalSeatsInFlight = flightData.totalSeats - (seatChange);

        // update the seats in flight
        const updateFlightRequestUrl = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
        await axios.patch(updateFlightRequestUrl,{totalSeats:finalSeatsInFlight});

        const UpdatedBooking = await this.BookingRepository.modifyBooking(bookingId,{
            noOfSeats,
            totalCost
        });

        // return {
        //     bookingId,
        //     noOfSeats,
        //     flightId,
        //     departureAirportId : flightData.departureAirportId,
        //     arrivalAirportId : flightData.arrivalAirportId,
        // }

        return UpdatedBooking;

    }

    async getAllBookings (userId) {
        try {
            const bookings = await this.BookingRepository.getAll(userId);
            return bookings;

        } catch (error) {
            throw error;
        }
    }

}   

module.exports = BookingService