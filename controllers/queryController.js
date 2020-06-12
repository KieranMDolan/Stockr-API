const { handleSymbolsRequest, handleUnauthedSymbolRequest, handleAuthedSymbolRequest } = require("../services/stockServices");

const getSymbols = (req, res, next) => {
  handleSymbolsRequest(req, res, next);
};

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
