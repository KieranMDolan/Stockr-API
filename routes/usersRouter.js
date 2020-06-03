const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/usersController');

/* POST user registration */
router.post('/register', registerUser);

/* POST user login */
router.post('/login', loginUser);


module.exports = router;
