// const AppError = require('../utils/appError');

// const handleCastError = (err) => {
//   const message = `Invalid ${err.path} : ${err.value}`;
//   return new AppError(message, 400);
// };

// // const handleMongoError = (err) => {
// //   const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
// //   const message = `Duplicated Field value : ${value}`;
// //   return new AppError("hi", 400);
// // };

// const handleValidationError = (err, res) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   res.status(400).json({ message: 'Invalid Input Data', errors: errors });
// };

// const errorDev = (error, res) => {
//   error.statusCode = error.statusCode || 500;

//   res.status(error.statusCode).json({
//     status: 'error',
//     message: error.message,
//     error: error,
//     stack: error.stack,
//   });
// };

// const handleExpireJwt = () => {
//   return new AppError('your token has been expired please login again', 401);
// };
// const handleInvalidJwt = () => {
//   return new AppError('Invalid Token , please login again ', 401);
// };

// const sendErrorProd = (error, res) => {
//   // Operational error trusted , send message to client
//   if (error.isOperational) {
//     res
//       .status(error.statusCode)
//       .json({ status: error.status, message: error.message });
//   }
//   // programming error or other unknown error , dont leak error deatails in production
//   else {
//     res
//       .status(500)
//       .json({ status: 'error', message: 'Something Went Wrong !' });
//   }
// };

// // Error Controller in Dev Mode and Production Mode and there functions
// module.exports = (error, req, res, next) => {
//   console.log(error.name);
//   // if (process.env.NODE_ENV === 'development') {
//   //   errorDev(error, res);
//   // } else if (process.env.NODE_ENV === 'production') {
//   let err = { ...error, message: error.message };
//   if (error.name === 'CastError') err = handleCastError(error); // Handling cast error for invalid id when getting an product
//   // if ((error.code = 11000)) err = handleMongoError(error); //  handling mongoerror when make a  duplicated fields when creating new product with same unique type
//   if (error.name === 'ValidationError') {
//     ///
//     return handleValidationError(error, res);
//   }
//   if (error.name === 'TokenExpiredError') err = handleExpireJwt(error, res);
//   if (error.name === 'JsonWebTokenError') err = handleInvalidJwt(error, res);

//   sendErrorProd(err, res);
//   // }
//   next();
// };

// The Sequelize Version ^^ Mongoose Version

const { ValidationError } = require('sequelize');
const AppError = require('../utils/appError');

const handleValidationError = (err, res) => {
  const errors = err.errors.map((e) => e.message);
  res.status(400).json({ message: 'Invalid Input Data', errors });
};

const handleUniqueConstraintError = (err) => {
  const message = `Duplicated Request`;
  return new AppError(message, 400);
};

const handleExpireJwt = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const handleInvalidJwt = () => {
  return new AppError('Invalid Token. Please log in again.', 401);
};

const errorController = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  let error = { ...err, message: err.message };

  console.log(error);
  if (error instanceof ValidationError) {
    error = handleValidationError(error, res);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    error = handleUniqueConstraintError(error, res);
  }

  if (error.name === 'TokenExpiredError') {
    error = handleExpireJwt(error, res);
  }

  if (error.name === 'JsonWebTokenError') {
    error = handleInvalidJwt(error, res);
  }

  // For other errors, you may want to customize the response based on your needs

  res.status(error.statusCode || 500).json({
    status: 'error',
    message: error.message || 'Something went wrong!',
  });

  next();
};

module.exports = errorController;
