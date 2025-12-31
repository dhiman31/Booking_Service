const { StatusCodes } = require('http-status-codes');
const {BookingService} = require('../services/index');
const { AppError } = require('../utils');

const BookingServ = new BookingService();

const createBooking = async (req,res) => {
    try {
        
        const booking = await BookingServ.createBooking(req.body);
        return res.status(StatusCodes.OK).json({
            data : booking,
            success : true,
            message : 'Successfully completed booking',
            err : {}
        })

    } catch (error) {
        return res.status(400).json({
            data:{},
            success:false,
            message : 'Not able to complete booking',
            err : error
        })
    }
}

module.exports = {
    createBooking
}