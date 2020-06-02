var express = require("express");
var router = express.Router();

const { getSymbols, getSingleSymbol } = require('../controllers/queries');

/* GET stocks/symbols and industry query */
router.get("/symbols", getSymbols);

/* GET stocks/:symbol */
router.get("/:symbol", getSingleSymbol);

/* GET stocks/authed/:symbol */
router.get("/authed/:symbol", function (req, res, next) {
  console.log("symbol = " + req.params.symbol);
  console.log("from: " + req.query.from);
  console.log("to: " + req.query.to);
  res.send("symbol = " + req.params.symbol);
});

module.exports = router;
