const { doesUserExist, insertUser } = require("../database/users");

const registerUser = (req, res, next) => {
  // Retrieve email and password from req.body
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed",
    });
    return;
  }
  // determine if user already exists in table
  if (doesUserExist(req, email)) {
    // if does exist, return error response
    res.status(409).json({
      error: true,
      message: "User already exists",
    });
  }
  // if user does not exist, insert into table
  insertUser(req, email, password).then(() => {
    res.status(201).json({ success: true, message: "User created" });
  });
};

module.exports = {
  registerUser,
};
