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

const paginated = (res, message, { items, pagination: { page, limit, total, totalPages, hasMore } }, statusCode = 200) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data: {
      items,
      pagination: { page, limit, total, totalPages, hasMore },
    },
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
  paginated,
  fail,
};
