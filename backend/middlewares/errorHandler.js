// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('ERROR:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map(e => ({ message: e.message }));
  }
  // Mongoose duplicate key error
  else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }
  // Mongoose CastError (invalid ID)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }
  // JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  // Token expired error
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Custom operational error from our app
  else if (err.isOperational) {
    statusCode = err.statusCode || 400;
    message = err.message;
  }

  // Production: don't leak error details
  else if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong!';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors })
  });
};

module.exports = errorHandler;