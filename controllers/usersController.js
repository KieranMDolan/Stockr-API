const { doCredentialsExist, doLogin, doRegister } = require("../services/authServices");

const registerUser = (req, res, next) => {

  if (doCredentialsExist(req, res, next)) {
    doRegister(req, res, next);
  }
};

const loginUser = (req, res, next) => {

  if (doCredentialsExist(req, res, next)) {
    doLogin(req, res, next);
  }

};

module.exports = {
  registerUser,
  loginUser,
};
