const errorHandler = (err, req, res, next) => {
    console.error(' Error occurred:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        url: req.url,
        method: req.method
    });

    // Default error
    let error = {
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    };

    // Specific error types
    if (err.name === 'ValidationError') {
        error.status = 400;
        error.message = 'Validation Error: ' + err.message;
    }

    if (err.name === 'CastError') {
        error.status = 400;
        error.message = 'Invalid request format';
    }

    if (err.code === 11000) {
        error.status = 400;
        error.message = 'Duplicate field value';
    }

    // Rate limit errors
    if (err.status === 429) {
        error.message = 'Too many requests. Please try again later.';
    }

    // Network errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        error.status = 503;
        error.message = 'External service unavailable';
    }

    res.status(error.status).json({
        error: error.message,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            details: err.response?.data 
        })
    });
};

export default errorHandler;