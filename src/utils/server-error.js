const {StatusCodes} = require('http-status-codes');

class ServerError extends Error {
    constructor(
        message = 'Something Went Wrong',
        explaination = 'Server Layer Error',
        statusCodes = StatusCodes.INTERNAL_SERVER_ERROR
    ){
        super();
        this.name = 'ServiceError';
        this.message = message;
        this.explaination = explaination;
        this.statusCodes = statusCodes;
    }
}

module.exports = ServerError;