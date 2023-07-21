import express from "express";
import { getSingleUser, insertUser } from "../models/user-model/userModel.js";
import { hashPassword } from "../helpers/bcryptHelper.js";
import { v4 as uuidv4 } from "uuid";
import { verificationEmail } from "../helpers/emailHelper.js";
const router = express.Router();

router.get("/:_id", async (req, res, next) => {
  const { _id } = req.params;
  console.log(_id);
  const user = await getSingleUser(_id);
  console.log(user);
  user._id
    ? res.json({
        status: "success",
        message: "The user has been returned",
        user,
      })
    : res.json({
        status: "error",
        message: "Cannot return the user, try again later",
      });
});
router.post("/", async (req, res, next) => {
  try {
    const { password } = req.body;
    req.body.password = hashPassword(password);
    req.body.emailValidationCode = uuidv4();
    const user = await insertUser(req.body);
    if (user._id) {
      res.json({
        status: "success",
        message:
          "We have sent you an email to verify your account, please check your email including the junk folder",
      });
      const url = `${process.env.ROOT_DOMAIN}/user/verify-email?c=${user.emailValidationCode}&e=${user.email}`;
      console.log(url);
      verificationEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        url,
      });
      return;
    } else {
      res.json({
        status: "error",
        message: "Request was unsuccessful,  try again later",
      });
    }
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.status = 200;
      error.message =
        "There is already another user registered with the email you provided";
    }
    next(error);
  }
});
export default router;
