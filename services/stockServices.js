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
 * @param {*} to the non-inclusive to date
 * @param {*} from the starting date
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
 * Checks whether passed queries are defined. Returns true if valid, false if not.
 * @param {*} queryTo the 'to' query passed in as req.query.to
 * @param {*} queryFrom the 'from' query, passed in as req.query.from
 */
const isValidQueries = (queryTo, queryFrom) => {
  if (queryTo !== undefined || queryFrom !== undefined) {
    return true;
  } else {
    return false;
  }
};

/**
 * Validates and handles error responses regarding queries.
 * @param {*} queryTo the queried to date
 * @param {*} queryFrom the queried from date
 * @returns to and from as [to, from] if queries are valid,
 * otherwise throws appropriate error.
 */
const getValidatedQueries = (queryTo, queryFrom) => {
  let to = MOST_RECENT_DATE_PLUS_ONE;
  let from = MOST_RECENT_DATE;

  // check for correct queries and error handling
  if (isValidQueries(queryTo, queryFrom)) {
    to = new Date(queryTo).toISOString().slice(0, 10);
    from = new Date(queryFrom).toISOString().slice(0, 10);
  } else {
    console.log("Got to throw 400 block");
    throw {
      status: 400,
      message:
        "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15",
    };
  }

  // check date validity and error handling
  if (!isValidDateRange(to, from)) {
    throw {
      status: 404,
      message: "No entries available for query symbol for supplied date range",
    };
  }
  return [to, from];
};

/**
 * Gets all distinct symbols from the database
 * @returns an array of stock objects
 * @throws an error object with the keys status and message
 */
async function getAllSymbols() {
  let rows;
  try {
    rows = await getAllSymbolsFromDb();
  } catch (e) {
    throw { status: 500, Message: "Database error" };
  }
  return rows;
}

/**
 * Gets all symbols matching the industry parameter used to call the method.
 * @param industry a string to match to records in the stock database
 * @returns a list of stock objects matching the industry parameter
 * @throws an error object with the keys status and message to be used for error responses
 */
async function getSymbolsByIndustry(industry) {
  let rows;
  try {
    rows = await getSymbolsByIndustryFromDb(industry);
  } catch (e) {
    throw { status: 500, Message: "Database error" };
  }
  if (rows.length === 0) {
    throw { status: 404, message: "Industry sector not found" };
  }
  return rows;
}

/**
 * Handles an unauthorised, parameterless single symbol request with error handling.
 * @param paramSymbol the requested symbol retrieved from the params of the request
 * @param queryLength the number of keys in the request query object
 * @returns the requested stock object data
 * @throws an error object with the keys 'status' and 'message'
 */
async function handleUnauthedSymbolRequest(paramSymbol, queryLength) {
  let data;
  // check for queries
  if (queryLength !== 0) {
    throw {
      status: 400,
      message:
        "Date parameters only available on authenticated route /stocks/authed",
    };
  }

  // query db
  try {
    data = await getMostRecentSingleStock(paramSymbol);
  } catch (e) {
    throw { status: 500, message: "Database error" };
  }

  if (data.length === 1) {
    return data[0];
  } else {
    throw { status: 404, message: "No entry for symbol in stocks database" };
  }
}

/**
 * Handles an authorised single stock request, optional to and from queries and
 * error/success responses.
 * @param {*} queryTo the reqeuested to date, split from the request queries
 * @param {*} queryFrom the requested from date, split from the request queries
 * @param {*} querySymbol the requested symbol, split from the request params
 * @returns the row data for the stock request
 * @throws an error object with the keys 'status' and 'message'
 */
async function handleAuthedSymbolRequest(queryTo, queryFrom, querySymbol) {
  let rows, to, from;

  try {
    [to, from] = getValidatedQueries(queryTo, queryFrom);
  } catch (e) {
    throw e;
  }

  try {
    rows = await getStockWithDateRange(from, to, querySymbol);
  } catch (e) {
    throw { status: 500, message: "Database Error" };
  }
  return rows;
}

module.exports = {
  handleUnauthedSymbolRequest,
  handleAuthedSymbolRequest,
  getAllSymbols,
  getSymbolsByIndustry,
};
