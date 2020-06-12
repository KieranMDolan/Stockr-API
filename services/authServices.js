const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../keys/forenvironmentvars");

const {getUsersWithEmail, insertUser} = require("../database/userQueries");

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

const createToken = (email) => {
  const secretKey = SECRET_KEY;
  const expires_in = 60 * 60 * 24;
  const exp = Date.now() + expires_in * 1000;
  return [jwt.sign({ email, exp }, secretKey), expires_in];
};

const doCredentialsExist = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return false;
  } else {
    return true;
  }
};

const doLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  getUsersWithEmail(req)
    .then((users) => {
      if (users.length === 0) {
        return null;
      } else {
        const user = users[0];
        return bcrypt.compare(password, user.hash);
      }
    })
    .then((match) => {
      if (!match) {
        res
          .status(401)
          .json({ error: true, message: "Incorrect email or password" });
        return;
      }
      const [token, expires_in] = createToken(email);
      res.status(200).json({ token_type: "Bearer", token, expires_in });
    })
    .catch(err => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
}

const doRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  getUsersWithEmail(req).then((users) => {
    if (users.length > 0) {
      res.status(409).json({
        error: true,
        message: "User already exists",
      });
      return;
    }

    insertUser(req, email, password).then(() => {
      res.status(201).json({ success: true, message: "User created" });
    });
  })
  .catch(err => {
    res.status(500).json({error: true, message: "Database error"});
  });
}

module.exports = {
  authorize,
  createToken,
  doCredentialsExist,
  doLogin,
  doRegister
};
