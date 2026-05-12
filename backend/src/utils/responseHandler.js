/**
 * Standard API Response Utility
 */
const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const fail = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    status: 'fail',
    message,
  });
};

module.exports = {
  success,
  fail,
};
