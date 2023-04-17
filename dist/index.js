"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_express2 = __toESM(require("express"));
var import_dotenv = __toESM(require("dotenv"));
var import_mongoose4 = __toESM(require("mongoose"));
var import_cors = __toESM(require("cors"));

// src/routes/router.ts
var import_express = __toESM(require("express"));

// src/controllers/stock.ts
var import_lodash2 = __toESM(require("lodash"));

// src/model/Stock.ts
var import_mongoose = __toESM(require("mongoose"));
var stockSchema = new import_mongoose.default.Schema(
  {
    symbol: {
      type: String
    },
    stockDetails: { type: Object, required: true }
  },
  { timestamps: true }
);
var StockModel = import_mongoose.default.model("Stock", stockSchema);

// src/lib/stock_wrapper.ts
var import_axios = __toESM(require("axios"));
var import_lodash = __toESM(require("lodash"));
var getDailyStock = async (symbol) => {
  const response = await import_axios.default.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${process.env.API_KEY}`);
  const dailyData = response.data["Time Series (Daily)"];
  if (import_lodash.default.isEmpty(dailyData) || import_lodash.default.isUndefined(dailyData) || import_lodash.default.isNull(dailyData)) {
    return "Nodata";
  }
  const filteredData = Object.keys(dailyData).slice(0, 7);
  const stockDetails = filteredData.map((date) => ({ date, ...dailyData[date] }));
  return stockDetails;
};
var getSymbol = async (keywords) => {
  const response = await import_axios.default.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${process.env.API_KEY}`);
  const data = response.data;
  if (import_lodash.default.isEmpty(data) || import_lodash.default.isUndefined(data) || import_lodash.default.isNull(data)) {
    return "Nodata";
  }
  return data;
};

// src/controllers/stock.ts
var import_node_cron = __toESM(require("node-cron"));
var stockApi = async (req, res) => {
  try {
    const { symbol } = req.query;
    import_node_cron.default.schedule("0 8 * * *", () => {
      historicalData();
    });
    if (typeof symbol === "string") {
      if (!isValidSymbol(symbol.toUpperCase())) {
        return res.status(400).json({
          message: "Invalid symbol"
        });
      }
      if (import_lodash2.default.isEmpty(symbol)) {
        return res.status(400).json({
          success: false,
          message: "Something you are missing"
        });
      }
      const stock = await StockModel.findOne({ symbol });
      if (stock) {
        return res.status(200).send(stock);
      }
      const stocks = await getDailyStock(symbol.toUpperCase());
      if (stocks === "Nodata")
        return res.status(404).json({
          message: "This symbol has no data"
        });
      const stockData = await StockModel.create({
        stockDetails: stocks,
        symbol
      });
      return res.status(200).send(stockData);
    }
  } catch (error3) {
    console.error(error3);
    return res.status(500).json({ error: "Server error" });
  }
};
var historicalData = async () => {
  const updateStocks = await StockModel.find();
  for (let i = 0; i < historicalData.length; i++) {
    let stockSymbol = updateStocks[i].symbol;
    const last7Days = await getDailyStock(stockSymbol);
    await StockModel.findOneAndUpdate({ symbol: stockSymbol }, { stockDetails: last7Days });
    console.log(i);
    console.log(stockSymbol);
  }
};
var isValidSymbol = (symbol) => {
  const pattern = /^[A-Z0-9.]{1,10}$/;
  return pattern.test(symbol);
};
var getSymbolData = async (req, res) => {
  try {
    const { keywords } = req.query;
    if (import_lodash2.default.isEmpty(keywords)) {
      return res.status(400).json({
        success: false,
        message: "Something you are missing"
      });
    }
    const symbols = await getSymbol(keywords);
    if (keywords === "Nodata")
      return res.status(404).json({
        message: "This symbol has no data"
      });
    return res.status(200).send(symbols);
  } catch (error3) {
    console.error(error3);
    return res.status(500).json({ error: "Server error" });
  }
};

// src/controllers/auth/register.ts
var import_nodemailer = __toESM(require("nodemailer"));
var import_winston2 = require("winston");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var import_validator = __toESM(require("validator"));
var import_lodash3 = __toESM(require("lodash"));

// src/logger.ts
var import_winston = __toESM(require("winston"));
var options = {
  file: {
    level: "info",
    filename: "./logs/app.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    // 5MB
    maxFiles: 5,
    colorize: false
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true
  }
};
var logger = import_winston.default.createLogger({
  levels: import_winston.default.config.npm.levels,
  transports: [
    new import_winston.default.transports.File(options.file),
    new import_winston.default.transports.Console(options.console)
  ],
  exitOnError: false
});

// src/model/User.ts
var import_mongoose2 = __toESM(require("mongoose"));
var userSchema = new import_mongoose2.default.Schema(
  {
    symbol: {
      type: String,
      ref: "Stock"
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
var UserModel = import_mongoose2.default.model("User", userSchema);

// src/model/UserOTPVerification.ts
var import_mongoose3 = __toESM(require("mongoose"));
var userOTPVerificationSchema = new import_mongoose3.default.Schema(
  {
    email: { type: String, ref: "User", required: true },
    otp: { type: String },
    expiresAt: { type: Number }
  }
);
var UserOTPVerificationModel = import_mongoose3.default.model("UserOTPVerification", userOTPVerificationSchema);

// src/controllers/auth/register.ts
var SECRET_TOKEN = "Ritika123";
var register = async (req, res) => {
  logger.info("Inside register");
  try {
    const { email, password } = req.body;
    if (import_lodash3.default.isEmpty(email) || import_lodash3.default.isEmpty(password)) {
      logger.error(`Provide all the details: ${import_winston2.error.message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details"
      });
    }
    const salt = import_bcrypt.default.genSaltSync(10);
    const hash = import_bcrypt.default.hashSync(password, salt);
    const emailExist = await UserModel.findOne({ email });
    if (emailExist) {
      logger.error(`User with ${email} already registered`);
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const createUser = await UserModel.create({
      email,
      password: hash
    });
    if (createUser) {
      logger.info(`User created:${createUser}`);
      await sendOTPVerificationEmail(email);
      return res.status(201).json({
        status: "PENDING",
        message: "Verification otp email sent"
      });
    }
    logger.error(`User data is not valid:${import_winston2.error.message}`);
    return res.status(400).json({
      success: false,
      message: "User data is not valid."
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};
var sendOTPVerificationEmail = async (email) => {
  logger.info("Inside OTP Verification");
  try {
    const otp = `${Math.floor(1e3 + Math.random() * 9e3)}`;
    const transporter = import_nodemailer.default.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "philip.heller@ethereal.email",
        pass: "sP5d4KRK4thfRzg77E"
      }
    });
    let message = {
      from: "philip.heller@ethereal.email",
      to: email,
      subject: "Verify your email",
      text: `<p>Enter <b> ${otp}</b></p><p>This code <b>expires in 5 min</b>.</p>`
    };
    await UserOTPVerificationModel.create({
      email,
      otp,
      expiresAt: Date.now() + 1e3 * 60 * 5
    });
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};
var verifyOTP = async (req, res) => {
  logger.info("Inside verifyOTP");
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Provide valid details" });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const UserOTPVerificationRecords = await UserModel.findOne({ email });
    if (!UserOTPVerificationRecords) {
      return res.status(400).json({
        message: "Account record does not exist or has been verified already"
      });
    }
    const otpDetails = await UserOTPVerificationModel.find({ email });
    console.log("hi", otpDetails);
    if (!otpDetails.length) {
      return res.status(400).json({
        message: "Your email is not exist or your otp has been expired"
      });
    }
    const dbOTP = otpDetails[otpDetails.length - 1].otp;
    const dbExpires = otpDetails[otpDetails.length - 1].expiresAt;
    if (dbOTP != otp || dbExpires < Date.now()) {
      return res.status(401).json({ message: "code has expired. Please request again" });
    }
    const bearerToken = import_jsonwebtoken.default.sign(
      {
        email
      },
      SECRET_TOKEN,
      {
        expiresIn: "5h"
      }
    );
    logger.info("Access successfully generated");
    await UserModel.updateOne({ email }, { isVerified: true });
    await UserOTPVerificationModel.deleteOne({ otp });
    return res.status(201).json({
      status: "VERIFIED",
      message: "Your otp has been verified",
      bearerToken
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server Error");
  }
};

// src/utils/verifyToken.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_winston3 = require("winston");
var SECRET_TOKEN2 = "Ritika123";
var verifyToken = async (req, res, next) => {
  logger.info("Inside verifyToken");
  try {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (Array.isArray(authHeader)) {
      authHeader = authHeader.join(",");
    }
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
      import_jsonwebtoken2.default.verify(token, SECRET_TOKEN2, (err, decoded) => {
        if (err) {
          console.log(err);
          logger.error("User is not authorized");
          return res.status(401).json({
            message: "User is not authorized"
          });
        } else {
          req.user = decoded;
          next();
        }
      });
    } else {
      logger.error("User is not authorized or token is missing in the header");
      return res.status(401).json({ message: "User is not authorized or token is missing in the header" });
    }
  } catch (err) {
    logger.error(`Error in verifyToken: ${import_winston3.error.message}`);
    return res.status(400).json({ message: "server error" });
  }
};
var verificationOtp = async (req, res, next) => {
  logger.info("Inside verificationOTP");
  const user = await UserModel.findOne({ email: req.user.email });
  if (!user)
    return res.status(400).json({ message: "User is not valid" });
  verifyToken(req, res, () => {
    if (user.isVerified === true) {
      next();
    } else {
      return res.status(403).json({ message: "You are not verified!" });
    }
  });
};

// src/routes/router.ts
var router = import_express.default.Router();
router.post("/api/v1/auth/register", register);
router.post("/api/v1/verifyOTP", verifyOTP);
router.get("/api/v1/stockPrice", verifyToken, verificationOtp, stockApi);
router.get("/api/v1/get-symbol", getSymbolData);

// src/httpLogger.ts
var import_morgan = __toESM(require("morgan"));
var import_morgan_json = __toESM(require("morgan-json"));
var format = (0, import_morgan_json.default)({
  method: ":method",
  url: ":url",
  status: ":status",
  contentLength: ":res[content-length]",
  responseTime: ":response-time"
});
var httpLogger = (0, import_morgan.default)(format, {
  stream: {
    write: (message) => {
      const {
        method,
        url,
        status,
        contentLength,
        responseTime
      } = JSON.parse(message);
      logger.info("HTTP Access Log", {
        timestamp: (/* @__PURE__ */ new Date()).toString(),
        method,
        url,
        status: Number(status),
        contentLength,
        responseTime: Number(responseTime)
      });
    }
  }
});

// src/index.ts
var app = (0, import_express2.default)();
import_dotenv.default.config();
var uri = "mongodb://0.0.0.0:27017";
import_mongoose4.default.connect(uri).then(() => console.log("Database connected")).catch((err) => {
  console.log(err);
});
app.use((0, import_cors.default)());
app.use(import_express2.default.json());
app.use(httpLogger);
app.use(router);
var PORT = 3e3;
app.listen(PORT || 5e3, () => {
  console.log("node server.js 3000");
});
