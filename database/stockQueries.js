const { all } = require("../app");

const MOST_RECENT_TRADING_DATE = "2020-03-24";

const getAllSymbolsFromDb = (req) => {
  return req.db.from("stocks").distinct("name", "symbol", "industry");
};

const getSymbolsByIndustryFromDb = (req) => {
  return req.db
    .where("industry", "like", `%${req.query.industry}%`)
    .from("stocks")
    .distinct("name", "symbol", "industry");
};

const getMostRecentSingleStock = (req) => {
  return req.db
    .where({ symbol: req.params.symbol, timestamp: MOST_RECENT_TRADING_DATE })
    .from("stocks")
    .select(
      "timestamp",
      "symbol",
      "name",
      "industry",
      "open",
      "high",
      "low",
      "close",
      "volumes"
    );
};

const getStockWithDateRange = (from, to, req) => {
  return req.db
    .where("symbol", req.params.symbol)
    .whereBetween("timestamp", [from, to])
    .from("stocks")
    .select(
      "timestamp",
      "symbol",
      "name",
      "industry",
      "open",
      "high",
      "low",
      "close",
      "volumes"
    );
};
module.exports = {
  getAllSymbolsFromDb,
  getSymbolsByIndustryFromDb,
  getMostRecentSingleStock,
  getStockWithDateRange,
};
