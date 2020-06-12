const { getAllSymbolsFromDb, getSymbolsByIndustryFromDb, getMostRecentSingleStock, getStockWithDateRange } = require("../database/stockQueries");

const MOST_RECENT_DATE_PLUS_ONE = "2020-03-25";
const MOST_RECENT_DATE = "2020-03-24";
const EARLIEST_DATE = "2019-11-06";

const isValidDateRange = (to, from) => {
  if (
    new Date(to) > new Date(MOST_RECENT_DATE_PLUS_ONE) ||
    new Date(from) < new Date(EARLIEST_DATE) ||
    new Date(to) < new Date(from)
  ) {
    return false;
  } else {
    return true;
  }
};

const isValidQueries = (queries) => {
  let queryLength = Object.keys(queries).length;
  if (queryLength === 2 || queryLength === 1) {
    for (const key in queries) {
      if (key !== "to" && key !== "from") {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

const getQueries = (req, res, next) => {
  let to = MOST_RECENT_DATE_PLUS_ONE;
  let from = MOST_RECENT_DATE;

  // check query length and error handling
  if (isValidQueries(req.query)) {
    to = new Date(req.query.to).toISOString().slice(0, 10);
    from = new Date(req.query.from).toISOString().slice(0, 10);
  } else {
    res.status(400).json({
      error: true,
      message:
        "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15",
    });
    return [null, null];
  }

  if (!isValidDateRange(to, from)) {
    res.status(404).json({
      error: true,
      message: "No entries available for query symbol for supplied date range",
    });
    return [null, null];
  }
  return [to, from];
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

const handleSymbolsRequest = (req, res, next) => {
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
}

const handleUnauthedSymbolRequest = (req, res, next) => {
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
}

const handleAuthedSymbolRequest = (req, res, next) => {
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
}

module.exports = {
  getQueries,
  handleSymbolsRequest,
  handleUnauthedSymbolRequest,
  handleAuthedSymbolRequest

};
