const {StatusCodes} = require('http-status-codes');

class ValidationError extends Error {
    constructor(error){
        const explaination = [];
        error.errors.forEach(element => {
            explaination.push(element.message);
        });

        super();
        this.name = 'ValidationError';
        this.message = 'Not able to validate the data sent in the request';
        this.explaination = explaination;
        this.statusCode = StatusCodes.BAD_REQUEST;
    }
}

module.exports = ValidationError;