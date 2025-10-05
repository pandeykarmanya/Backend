class ApiError extends Error {
    constructor(
        statusCode,
        messsage = "Something went wrong",
        errors = [],
        statck = ""
    ){
        super(messsage);
        this.statusCode = statusCode;
        this.errors = errors;
        this.statck = statck;
        this.success = false;
        this.data = null;

        if (statck){
        this.statck = statck;
        }

        else{
            Error.captureStackTrace(this, this.constructor);
        }
}}

export { ApiError };