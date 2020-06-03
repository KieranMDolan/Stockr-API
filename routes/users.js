const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/users');

/* POST user registration */
router.post('/register', registerUser);

/* POST user login */
router.post('/login', (req, res) => {
  res.send({"success": true, "message": "logged in"});
});


module.exports = router;
