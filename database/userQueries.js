const bcrypt = require("bcrypt");
const options = require("../knexfile.js");
const knex = require("knex")(options);

// User/Auth Services related db queries

/**
 * get all users with the email passed through the request object
 * @param {*} req
 */
const getUsersWithEmail = (req) => {
  const email = req.body.email;
  return knex.from("users").select("*").where("email", email);
};

/**
 * Inserts a new user into the users table with the email and a hashed + salted password
 * @param {*} req
 * @param {*} email
 * @param {*} password
 */
const insertUser = (req, email, password) => {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  return knex.from("users").insert({ email, hash });
};

module.exports = {
  getUsersWithEmail,
  insertUser,
};
