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
      res.json({ Error: true, Message: "Error in MySQL query" });
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
        data = { "error": true, message: "Industry sector not found" };
        status = 404;
      }
      res.status(status).json(data);
    })
    .catch((err) => {
      console.log(err);
    });
};

const getSingleSymbol = (req, res, next) => {
  req.db
    .where("symbol", req.params.symbol)
    .from("stocks")
    .distinct("name", "symbol", "industry")
    .then((row) => {
      let data = 
      row.length > 0
      ? row
      : {
        "error": true,
        "message": "No entry for symbol in stocks database"
      }
      res.status().json(row);
    })
    .catch((err) => {
      console.log(err);
      res.json({ Error: true, Message: "Error in MySQL query" });
    });
};

const getAuthSingleSymbol = (req, res, next) => {};

module.exports = {
  getSymbols,
  getSingleSymbol,
};
