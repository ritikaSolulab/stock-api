import { Response } from "express";
import lodash from "lodash";
import { StockModel } from "../model/Stock";
import { getDailyStock, getSymbol } from "../lib/stock_wrapper";
import { Request } from "../types";

//function to find the stock price from the database from particular symbol
export const stockApi = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.query;
    if (typeof symbol === "string") {
      if (!isValidSymbol(symbol.toUpperCase())) {
        return res.status(400).json({
          message: "Invalid symbol",
        });
      }
      if (lodash.isEmpty(symbol)) {
        return res.status(400).json({
          success: false,
          message: "Something you are missing",
        });
      }
      const stock = await StockModel.findOne({ symbol: symbol });
      if (stock) {
        return res.status(200).send(stock);
      }

      const stocks = await getDailyStock(symbol.toUpperCase());
      if (stocks === "Nodata")
        return res.status(404).json({
          message: "This symbol has no data",
        });
      const stockData = await StockModel.create({
        stockDetails: stocks,
        symbol: symbol,
      });
      return res.status(200).send(stockData);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};



export const isValidSymbol = (symbol: string): Boolean => {
  const pattern = /^[A-Z0-9.]{1,10}$/;
  return pattern.test(symbol);
};


export const getSymbolData = async (req: Request, res: Response) => {
  try {
    const { keywords } = req.query;
      if (lodash.isEmpty(keywords)) {
        return res.status(400).json({
          success: false,
          message: "Something you are missing",
        });
      }
      const symbols = await getSymbol(keywords as string);
      if (keywords === "Nodata")
        return res.status(404).json({
          message: "This symbol has no data",
        });
      return res.status(200).send(symbols);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};



