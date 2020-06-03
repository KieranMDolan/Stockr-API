const bcrypt = require("bcrypt");

const getUsersWithEmail = (req) => {
  const email = req.body.email;
  return req.db.from("users").select("*").where("email", email);
};

const insertUser = (req, email, password) => {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  return req.db.from("users").insert({ email, hash });
};

module.exports = {
  getUsersWithEmail,
  insertUser,
};
