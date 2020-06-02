var express = require('express');
var router = express.Router();

/* POST user registration */
router.post('/register', (req, res) => {
  res.send({"success": true, "message": "User created"});
});

/* POST user login */
router.post('/login', (req, res) => {
  res.send({"success": true, "message": "logged in"});
});


module.exports = router;
