const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Return safe error messages to users while logging detailed server diagnostics privately.
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'An unexpected error occurred. Please try again later.' : message,
    // Only send stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
