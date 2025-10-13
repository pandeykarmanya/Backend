class ApiError extends Error {
    constructor(
        statusCode,
        messsage = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(messsage);
        this.statusCode = statusCode;
        this.errors = errors;
        this.stack = stack;
        this.success = false;
        this.data = null;

        if (stack){
        this.stack = stack;
        }

        else{
            Error.captureStackTrace(this, this.constructor);
        }
}}

export { ApiError };