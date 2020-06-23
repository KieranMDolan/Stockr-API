const MOST_RECENT_TRADING_DATE = "2020-03-24";
const options = require("../knexfile.js");
const knex = require("knex")(options);

// returns the name, symbol and industry of all distinct stocks
async function getAllSymbolsFromDb(req) {
  return await knex.from("stocks").distinct("name", "symbol", "industry");
}

// returns the name, symbol and industry of all stocks where the industry query is in their
// industry string
async function getSymbolsByIndustryFromDb(req) {
  return await knex
    .where("industry", "like", `%${req.query.industry}%`)
    .from("stocks")
    .distinct("name", "symbol", "industry");
}

// gets all values of a single stock for the most recent trading date
async function getMostRecentSingleStock(req) {
  return await knex
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
}

// get all values of a single stock for a from-to (non inclusive to) date range
async function getStockWithDateRange(from, to, req) {
  return await knex
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
}

module.exports = {
  getAllSymbolsFromDb,
  getSymbolsByIndustryFromDb,
  getMostRecentSingleStock,
  getStockWithDateRange,
};
