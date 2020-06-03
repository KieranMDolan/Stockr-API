const bcrypt = require("bcrypt");

const doesUserExist = (req, email) => {
  req.db
    .from("users")
    .select("*")
    .where("email", email)
    .then((users) => {
      if (users.length > 0) {
        return true;
      } else {
        return false;
      }
    });
};

const insertUser = (req, email, password) => {
  const saltRounds = 10;
  const hash = bcrypt.hashsync(password, saltRounds);
  return req.db.from("users").insert({ email, hash });
};

module.exports = {
  doesUserExist,
  insertUser,
};
