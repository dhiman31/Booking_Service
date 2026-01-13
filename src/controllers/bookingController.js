const { StatusCodes } = require('http-status-codes');
const {BookingService} = require('../services/index');
const { AppError } = require('../utils');

const BookingServ = new BookingService();

const createBooking = async (req,res) => {
    try {
        const token = req.headers['x-access-token'];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        const flightId = req.body.flightId;
        const noOfSeats = req.body.noOfSeats;
        
        const booking = await BookingServ.createBooking(
            {
                token : token,
                flightId : flightId,
                noOfSeats : noOfSeats
            }
        );
        return res.status(StatusCodes.OK).json({
            data : booking,
            success : true,
            message : 'Successfully completed booking',
            err : {}
        })

    } catch (error) {
        return res.status(error.statusCode).json({
            data:{},
            success:false,
            message : 'Not able to complete booking',
            err : error
        })
    }
}

const cancelBooking = async (req,res) => {
    try {
        
        const response = await BookingServ.cancelBooking(req.params.id);
        return res.status(StatusCodes.OK).json({
            data : response,
            success : true,
            message : 'Successfully cancelled booking',
            err : {}
        })
        
    } catch (error) {
        return res.status(error.statusCode).json({
            name:error.name,
            message : error.message,
            explaination : error.explaination,
            success:false,
            statusCode : error.statusCode,
            data:{}
        })
    }
}

const modifyBooking = async (req,res) => {
    try {
        const booking = await BookingServ.modifyBooking(req.params.id,req.body);
        return res.status(StatusCodes.OK).json({
            data : booking,
            success : true,
            message : 'Successfully modified booking',
            err : {}
        })

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            name:error.name,
            message : error.message,
            explaination : error.explaination,
            success:false,
            statusCode : error.statusCode,
            data:{}
        })
    }
}

const getAllBookings = async (req,res) => {
    try {
        
        const bookings = await BookingServ.getAllBookings(req.params.id);
        return res.status(StatusCodes.OK).json({
            data : bookings,
            success : true,
            message : 'Successfully fetched all bookings',
            err : {}
        })

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            name:error.name,
            message : error.message,
            explaination : error.explaination,
            success:false,
            statusCode : error.statusCode,
            data:{}
        })
    }
}

module.exports = {
    createBooking,
    cancelBooking,
    modifyBooking,
    getAllBookings
}