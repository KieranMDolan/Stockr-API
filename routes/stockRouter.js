var express = require("express");
var router = express.Router();

const {
  getSymbols,
  getAuthSingleSymbol,
  getSingleSymbol,
} = require("../controllers/stockController");
const { authorize } = require("../services/authServices");

/* GET stocks/symbols with optional industry query */
router.get("/symbols", getSymbols);

/* GET stocks/:symbol */
router.get("/:symbol", getSingleSymbol);

/* GET stocks/authed/:symbol with optional to and from queries*/
router.get("/authed/:symbol", authorize, getAuthSingleSymbol);

module.exports = router;
