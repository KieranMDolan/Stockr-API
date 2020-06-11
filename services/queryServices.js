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

module.exports = {
  getQueries,
};
