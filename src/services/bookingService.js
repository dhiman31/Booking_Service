const {BookingRepository} = require('../repository/index');
const { ServiceError } = require('../utils');
const axios = require('axios');
const {FLIGHT_SERVICE_PATH} = require('../config/serverConfig');

class BookingService {
    constructor(){
        this.BookingRepository = new BookingRepository();
    }

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
            return finalBooking
            
        } catch (error) {
            if(error.name === 'RepositoryError' || error.name === 'ValidationError'){
                throw error;
            }
            throw new ServiceError();
        }
    }
}

module.exports = BookingService