const {
  getAllSymbols,
  getSymbolsByIndustry,
  handleUnauthedSymbolRequest,
  handleAuthedSymbolRequest,
} = require("../services/stockServices");

async function getSymbols(req, res, next) {
  // handleSymbolsRequest(req, res, next);
  // let queryLength = Object.keys(req.query).length;
  let queryExists = Object.keys(req.query).length > 0;
  if (!queryExists) {
    try {
      getAllSymbols(req, res, next);
    } catch (e) {
      if (!e.status) {
        res.status(500).json({ error: true, message: "Unknown Error" });
      } else {
        res.status(e.status).json({ error: true, message: e.message });
      }
    }
  } else if (queryExists && req.query.industry) {
    try {
      const stocks = await getSymbolsByIndustry(req, res, next);
      res.status(200).json(stocks);
    } catch (e) {
      console.log(e);
      if (!e.status) {
        res.status(500).json({ error: true, message: "Unknown Error" });
      } else {
        res.status(e.status).json({ error: true, message: e.message });
      }
    }
  } else {
    res.status(400).json({
      error: true,
      message: "Invalid query parameter: only 'industry' is permitted",
    });
  }
}

const getSingleSymbol = (req, res, next) => {
  handleUnauthedSymbolRequest(req, res, next);
};

const getAuthSingleSymbol = (req, res, next) => {
  handleAuthedSymbolRequest(req, res, next);
};

module.exports = {
  getSymbols,
  getSingleSymbol,
  getAuthSingleSymbol,
};
