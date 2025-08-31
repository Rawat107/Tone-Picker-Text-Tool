const errorHandler = (err, req, res, next) => {
    console.error("Error occurred:", {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method
    });


    //default error
    let error = {
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    }

    // Specific error types
    if (err.name === 'ValidationError'){
        error.status = 400;
        error.message = 'Validation Error' + err.message;
    }

    if (err.name === 'CaseError'){
        error.status = 400;
        error.message = 'Dublicate field value';
    }

    if(err.code === 11000){
        error.status = 400;
        error.message = 'Dublicate field value';
    }

    //Rate limit errors
    if(err.status === 429){
        error.message = 'Two many requests. Please try again later.'
    }

    //Network errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        error.status = 503;
        error.message = 'Service Unavailable. Please try again later.';
    }

    res.status(error.status).json({
        error: error.message,
        timestamp: new Date().toISOString(),
        ...err(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            details: err.response?.data
        })
    })
}

export default errorHandler;
