const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
      field: Object.keys(err.keyPattern || {}),
    });
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;