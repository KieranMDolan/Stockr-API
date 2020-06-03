var express = require("express");
var router = express.Router();

const { getSymbols, getAuthSingleSymbol, getSingleSymbol } = require('../controllers/queryController');

/* GET stocks/symbols and industry query */
router.get("/symbols", getSymbols);

/* GET stocks/:symbol */
router.get("/:symbol", getSingleSymbol);

/* GET stocks/authed/:symbol with to and from queries*/
router.get("/authed/:symbol", getAuthSingleSymbol);


module.exports = router;
