const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { getUsersWithEmail, insertUser } = require("../database/userQueries");
const { SECRET_KEY } = require("../keys/forenvironmentvars");

const registerUser = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  checkCredentialsExist(req, res, next);

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
  });
};

const loginUser = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  checkCredentialsExist(req, res, next);

  getUsersWithEmail(req)
    .then((users) => {
      if (users.length === 0) {
        console.log("User does not exist");
        return;
      }

      const user = users[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((match) => {
      if (!match) {
        console.log("Passwords do not match");
        res
          .status(401)
          .json({ error: true, message: "Incorrect email or password" });
        return;
      }
      const [token, expires_in] = createToken(email);
      res.status(200).json({ token_type: "Bearer", token, expires_in });
    });
};

const checkCredentialsExist = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }
};

const createToken = (email) => {
  const secretKey = SECRET_KEY;
  const expires_in = 60 * 60 * 24;
  const exp = Date.now() + expires_in * 1000;
  return [jwt.sign({ email, exp }, secretKey), expires_in];
};

module.exports = {
  registerUser,
  loginUser,
};
