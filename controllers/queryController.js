const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../keys/forenvironmentvars");


const getSymbols = (req, res, next) => {
  let queryLength = Object.keys(req.query).length;
  if (queryLength === 0) {
    getAllSymbols(req, res, next);
  } else if (queryLength === 1 && req.query.industry) {
    getSymbolsByIndustry(req, res, next);
  } else {
    res.status(400).json({
      Error: true,
      Message: "Invalid query parameter: only 'industry' is permitted",
    });
  }
};

const getAllSymbols = (req, res, next) => {
  req.db
    .from("stocks")
    .distinct("name", "symbol", "industry")
    .then((rows) => {
      res.json(rows);
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

const getSymbolsByIndustry = (req, res, next) => {
  req.db
    .where("industry", "like", `%${req.query.industry}%`)
    .from("stocks")
    .distinct("name", "symbol", "industry")
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

  req.db
    .where({ symbol: req.params.symbol, timestamp: "2020-03-24" })
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
    )
    .then((row) => {
      // TODO refactor this to a helper function, repeated above
      let data;
      let status;
      if (row.length === 1) {
        data = row;
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
  let to = "2020-03-25";
  let from = "2020-03-24";
  let queryLength = Object.keys(req.query).length;
  if (queryLength === 2 || queryLength === 1) {
    for (const key in req.query) {
      if (key !== "to" && key !== "from") {
        res.status(400).json({
          error: true,
          message:
            "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15",
        });
        return;
      }
    }
    to = new Date(req.query.to).toISOString().slice(0, 10);
    from = new Date(req.query.from).toISOString().slice(0, 10);
  } else if (queryLength > 2) {
    res.status(400).json({
      error: true,
      message:
        "Parameters allowed are 'from' and 'to', example: /stocks/authed/AAL?from=2020-03-15",
    });
    return;
  }

  req.db
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
    )
    .then((row) => {
      // TODO refactor this to a helper function, repeated above
      let data;
      let status;
      if (row.length >= 1) {
        data = row;
        status = 200;
      } else {
        data = {
          error: true,
          message:
            "No entries available for query symbol for supplied date range",
        };
        status = 404;
      }
      res.status(200).json(row);
    })
    .catch((err) => {
      res.status(500).json({ Error: true, Message: "Database error" });
    });
};

const authorize = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  // Retrieve token
  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
    console.log("Token: ", token);
  } else {
    authorizationErrorHandler(req, res, next, "Authorization header not found");
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded.exp < Date.now()) {
      authorizationErrorHandler(req, res, next, "Token has expired");
    }
    next();
  } catch (err) {
    authorizationErrorHandler(req, res, next, "Token is invalid");
  }
};

const authorizationErrorHandler = (req, res, next, message) => {
  res.status(403).json({
    error: true,
    message: message,
  });
}

module.exports = {
  getSymbols,
  getSingleSymbol,
  getAuthSingleSymbol,
  authorize,
};
