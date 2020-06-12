const MOST_RECENT_TRADING_DATE = "2020-03-24";

// returns the name, symbol and industry of all distinct stocks
const getAllSymbolsFromDb = (req) => {
  return req.db.from("stocks").distinct("name", "symbol", "industry");
};

// returns the name, symbol and industry of all stocks where the industry query is in their
// industry string
const getSymbolsByIndustryFromDb = (req) => {
  return req.db
    .where("industry", "like", `%${req.query.industry}%`)
    .from("stocks")
    .distinct("name", "symbol", "industry");
};

// gets all values of a single stock for the most recent trading date
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

// get all values of a single stock for a from-to (non inclusive to) date range
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
