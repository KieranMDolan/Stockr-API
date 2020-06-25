const {
  getAllSymbols,
  getSymbolsByIndustry,
  handleUnauthedSymbolRequest,
  handleAuthedSymbolRequest,
} = require("../services/stockServices");

async function handleUnqueriedSymbolRequest(res) {
  try {
    const stocks = await getAllSymbols();
    res.status(200).json(stocks);
  } catch (e) {
    if (!e.status) {
      res.status(500).json({ error: true, message: "Unknown Error" });
    } else {
      res.status(e.status).json({ error: true, message: e.message });
    }
  }
}

async function handleQueriedSymbolRequest(req, res) {
  try {
    const stocks = await getSymbolsByIndustry(req.query.industry);
    res.status(200).json(stocks);
  } catch (e) {
    if (!e.status) {
      res.status(500).json({ error: true, message: "Unknown Error" });
    } else {
      res.status(e.status).json({ error: true, message: e.message });
    }
  }
}

function getSymbols(req, res) {
  let queryExists = Object.keys(req.query).length > 0;

  if (!queryExists) {
    handleUnqueriedSymbolRequest(res);
  } else if (queryExists && req.query.industry) {
    handleQueriedSymbolRequest(req, res);
  } else {
    res.status(400).json({
      error: true,
      message: "Invalid query parameter: only 'industry' is permitted",
    });
  }
}

const getSingleSymbol = (req, res, next) => {
  handleUnauthedSymbolRequest(req, res, next);
};

async function getAuthSingleSymbol(req, res) {
  try {
    const symbolData = await handleAuthedSymbolRequest(
      req.query.to,
      req.query.from,
      req.params.symbol
    );
    res.status(200).json(symbolData);
  } catch (e) {
    if (!e.status) {
      res.status(500).json({ error: true, message: "Unknown Error" });
    } else {
      res.status(e.status).json({ error: true, message: e.message });
    }
  }
};

module.exports = {
  getSymbols,
  getSingleSymbol,
  getAuthSingleSymbol,
};
