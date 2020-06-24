const {
  getAllSymbolsFromDb,
  getSymbolsByIndustryFromDb,
  getMostRecentSingleStock,
  getStockWithDateRange,
} = require("../database/stockQueries");

// hardcoded date boundaries to be replaced with scheduled db query extractions
// in the case of actual deployment
const MOST_RECENT_DATE_PLUS_ONE = "2020-03-25";
const MOST_RECENT_DATE = "2020-03-24";
const EARLIEST_DATE = "2019-11-06";

/**
 * Checks if a date range is valid in regards to the database.
 * @param {*} to
 * @param {*} from
 */
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

/**
 * Validates to and from queries. Returns true if valid, false if not.
 * @param {*} queries
 */
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

/**
 * Validates and handles error responses regarding queries.
 * Returns to and from as [to, from] if queries are valid OR not-included, otherwise returns
 * [null, null].
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
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

  // check date validity and error handling
  if (!isValidDateRange(to, from)) {
    res.status(404).json({
      error: true,
      message: "No entries available for query symbol for supplied date range",
    });
    return [null, null];
  }
  return [to, from];
};

/**
 * Gets all distinct symbols from the database and responds with either a
 * json array of the records, or a 500 error message.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getAllSymbols() {
  let rows;
  try {
    rows = await getAllSymbolsFromDb();
  } catch (e) {
    throw { status : 500, Message: "Database error"};
  }
  return rows;
};

/**
 * Sends response of all distinct symbols from the database that contain the queried string
 * within their industry field and error responses
 */
async function getSymbolsByIndustry(industry) {
  let rows;
  try {
     rows = await getSymbolsByIndustryFromDb(industry);
    } catch (e) {
      throw { status : 500, Message: "Database error"};
    }
    if (rows.length === 0) {
      throw { status: 404, message: "Industry sector not found" };
    }
    return rows;
}

/**
 * Calls the correct symbol request function according to presence of an industry query in the
 * request object OR sends an error response if an incorrect query parameter is included.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
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
};

/**
 * Handles an unauthorised, parameterless single symbol request with error handling.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const handleUnauthedSymbolRequest = (req, res, next) => {
  // check for queries
  let queryLength = Object.keys(req.query).length;
  if (queryLength !== 0) {
    res.status(400).json({
      error: true,
      message:
        "Date parameters only available on authenticated route /stocks/authed",
    });
    return;
  }

  // query db
  getMostRecentSingleStock(req.params.symbol)
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

/**
 * Handles an authorised single stock request, optional to and from queries and
 * error/success responses.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const handleAuthedSymbolRequest = (req, res, next) => {
  [to, from] = getQueries(req, res, next);
  // if an error response has already been sent
  if (!to && !from) {
    return;
  }

  // query db
  getStockWithDateRange(from, to, req.params.symbol)
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
  getQueries,
  handleSymbolsRequest,
  handleUnauthedSymbolRequest,
  handleAuthedSymbolRequest,
  getAllSymbols,
  getSymbolsByIndustry,
};
