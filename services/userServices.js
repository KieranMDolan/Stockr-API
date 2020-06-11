const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../keys/forenvironmentvars");

const authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  // Retrieve token
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  } else {
    authorizationErrorHandler(req, res, next, "Authorization header not found");
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.exp < Date.now()) {
      authorizationErrorHandler(req, res, next, "Token has expired");
    }
    next();
  } catch (err) {
    authorizationErrorHandler(req, res, next, "Token is invalid");
  }
};

const authorizationErrorHandler = (req, res, next, message) => {
  res.status(403).json({
    error: true,
    message: message,
  });
};

module.exports = {
  authorize,
};
