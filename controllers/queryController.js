// const jwt = require("jsonwebtoken");
// const { SECRET_KEY } = require("../keys/forenvironmentvars");

const { getQueries } = require("../services/queryServices");
const {
  getAllSymbolsFromDb,
  getSymbolsByIndustryFromDb,
  getMostRecentSingleStock,
  getStockWithDateRange,
} = require("../database/stockQueries");

const getSymbols = (req, res, next) => {
  let queryLength = Object.keys(req.query).length;
  if (queryLength === 0) {
    getAllSymbols(req, res, next);
  } else if (queryLength === 1 && req.query.industry) {
    getSymbolsByIndustry(req, res, next);
  } else {
    res.status(400).json({
      error: true,
      message: "Invalid query parameter: only 'industry' is permitted",
    });
  }
};

const getAllSymbols = (req, res, next) => {
  getAllSymbolsFromDb(req)
    .then((rows) => {
      res.json(rows);
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

const getSymbolsByIndustry = (req, res, next) => {
  getSymbolsByIndustryFromDb(req)
    .then((rows) => {
      let data;
      let status;
      if (rows.length > 0) {
        data = rows;
        status = 200;
      } else {
        data = { error: true, message: "Industry sector not found" };
        status = 404;
      }
      res.status(status).json(data);
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

const getSingleSymbol = (req, res, next) => {
  let queryLength = Object.keys(req.query).length;
  if (queryLength !== 0) {
    res.status(400).json({
      error: true,
      message:
        "Date parameters only available on authenticated route /stocks/authed",
    });
    return;
  }

  getMostRecentSingleStock(req)
    .then((row) => {
      let data;
      let status;
      if (row.length === 1) {
        data = row[0];
        status = 200;
      } else {
        data = {
          error: true,
          message: "No entry for symbol in stocks database",
        };
        status = 404;
      }
      res.status(status).json(data);
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

const getAuthSingleSymbol = (req, res, next) => {
  [to, from] = getQueries(req, res, next);
  if (!to && !from) {
    return;
  }

  getStockWithDateRange(from, to, req)
    .then((row) => {
      let data;
      let status;
      if (row.length >= 1) {
        data = row;
        status = 200;
        res.status(200).json(row);
      }
      return;
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

module.exports = {
  getSymbols,
  getSingleSymbol,
  getAuthSingleSymbol,
};
