import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { error } from "winston";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import lodash from "lodash";
import { logger } from "../../logger";
import { UserModel } from "../../model/User";
import { UserOTPVerificationModel } from "../../model/UserOTPVerification";

const SECRET_TOKEN = "Ritika123";

export const register = async (req: Request, res: Response) => {
  logger.info("Inside register");
  try {
    const { email, password } = req.body;
    if (lodash.isEmpty(email) || lodash.isEmpty(password)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // checking if email is exist or not
    const emailExist = await UserModel.findOne({ email: email });
    if (emailExist) {
      logger.error(`User with ${email} already registered`);
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const createUser = await UserModel.create({
      email,
      password: hash,
    });
    if (createUser) {
      logger.info(`User created:${createUser}`);
      await sendOTPVerificationEmail(email);
      return res.status(201).json({
        status: "PENDING",
        message: "Verification otp email sent",
      });
    }
    logger.error(`User data is not valid:${(error as any).message}`);
    return res.status(400).json({
      success: false,
      message: "User data is not valid.",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server error");
  }
};

export const sendOTPVerificationEmail = async (email: string) => {
  logger.info("Inside OTP Verification");
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'philip.heller@ethereal.email',
          pass: 'sP5d4KRK4thfRzg77E'
      }
    });
    let message = {
      from: "philip.heller@ethereal.email",
      to: email,
      subject: "Verify your email",
      text: `<p>Enter <b> ${otp}</b></p><p>This code <b>expires in 5 min</b>.</p>`,
    };
    await UserOTPVerificationModel.create({
      email: email,
      otp: otp,
      expiresAt: Date.now() + 1000 * 60 * 5,
    });
    await transporter.sendMail(message);
  } catch (err) {
    console.log(err);
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  logger.info("Inside verifyOTP");
  try {
    let { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Provide valid details" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const UserOTPVerificationRecords = await UserModel.findOne({email:email});
    if (!UserOTPVerificationRecords) {
      return res.status(400).json({
        message: "Account record does not exist or has been verified already",
      });
    }
    const otpDetails = await UserOTPVerificationModel.find({email:email})
    console.log("hi",otpDetails)
    if(!otpDetails.length){
      return res.status(400).json({
        message: 'Your email is not exist or your otp has been expired'
      })
    }
    const dbOTP = otpDetails[otpDetails.length-1].otp
    const dbExpires = otpDetails[otpDetails.length-1].expiresAt
    if (dbOTP != otp || (dbExpires as number < Date.now())){
      return res.status(401).json({ message: "code has expired. Please request again" });
    }
    const bearerToken = Jwt.sign(
        {
          email: email,
        },
        SECRET_TOKEN as string,
        {
          expiresIn: "5h",
        }
      );
      logger.info("Access successfully generated");
      await UserModel.updateOne({ email: email }, { isVerified: true });
      await UserOTPVerificationModel.deleteOne({otp:otp})
      return res.status(201).json({
        status: "VERIFIED",
        message: "Your otp has been verified",
        bearerToken,
      });
  } catch (err) {
    console.log(err);
    return res.status(400).json("Server Error");
  }
};

export const resendOtpVerificationEmail = async (
  req: Request,
  res: Response
) => {
  logger.info("Inside resend otp");
  try {
    const { email, password } = req.body;
    if (lodash.isEmpty(email) || lodash.isEmpty(password)) {
      logger.error(`Provide all the details: ${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "Provide all the details",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // checking if email is exist or not
    const emailExist = await UserModel.findOne({ email: email });
    if (emailExist) {
      logger.error(`User with ${email} already registered`);
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const createUser = new UserModel({
      email,
      password: hash,
    });
    console.log(createUser);
    if (createUser) {
      logger.info(`User created:${createUser}`);
      const bearerToken = Jwt.sign(
        {
          createUser: {
            email: createUser.email,
            password: createUser.password,
            id: createUser.id,
          },
        },
        SECRET_TOKEN as string,
        {
          expiresIn: "5h",
        }
      );

      logger.info("Access successfully generated");
      await sendOTPVerificationEmail(email);
      return res.status(201).json({
        status: "PENDING",
        message: "Verification otp email sent",
        bearerToken,
      });
    } else {
      logger.error(`User data is not valid:${(error as any).message}`);
      return res.status(400).json({
        success: false,
        message: "User data is not valid.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json("Provide valid details");
  }
};
