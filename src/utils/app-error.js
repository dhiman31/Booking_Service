
class AppError extends Error {
    constructor(
        name,
        message,
        explaination,
        statusCodes
    ){
        super();
        this.name = name;
        this.message = message;
        this.explaination = explaination;
        this.statusCodes = statusCodes;
    }
}

module.exports = AppError;