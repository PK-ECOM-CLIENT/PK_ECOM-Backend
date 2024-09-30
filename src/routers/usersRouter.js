import express from "express";
import {
  findOneUser,
  insertUser,
  updateOneUser,
} from "../models/user-model/userModel.js";
import { comparePassword, hashPassword } from "../helpers/bcryptHelper.js";
import { v4 as uuidv4 } from "uuid";
import { verificationEmail } from "../helpers/emailHelper.js";
import { createJWTs, signAccessJWT, verifyRefreshJWT } from "../helpers/jwtHelper.js";
import { userAuth } from "../middlewares/authMiddleware.js";
const router = express.Router();
// get user by access token, helping to auto login
router.get("/", userAuth, async (req, res, next) => {
  try {
    const user = req.userInfo;
    user.password = undefined;
    user.refreshJWT = undefined;
    res.json({
      status: "success",
      message: "user has been returned",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    // const { password } = req.body;
    // req.body.password = hashPassword(password);
    // req.body.emailValidationCode = uuidv4();
    // const user = await insertUser(req.body);
    // if (user._id) {
    //   res.json({
    //     status: "success",
    //     message:
    //       "We have sent you an email to verify your account, please check your email including the junk folder",
    //   });
    //   const url = `${process.env.ROOT_DOMAIN}/user/verify-email?c=${user.emailValidationCode}&e=${user.email}`;
    //   verificationEmail({
    //     firstName: user.firstName,
    //     lastName: user.lastName,
    //     email: user.email,
    //     url,
    //   });
    //   return;
    // } else {
    //   res.json({
    //     status: "error",
    //     message: "Request was unsuccessful,  try again later",
    //   });
    // }
    res.json({
        status: "error",
        message: "Registering new users service is unauthorised at the moment",
      });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error collection")) {
      error.status = 200;
      error.message =
        "There is already another user registered with the email you provided";
    }
    next(error);
  }
});
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //   find the user on the basis of given email
    const user = await findOneUser({ email });
    if (user?._id) {
      if (user.status !== "active") {
        return res.json({
          status: "error",
          message:
            "The account has not been verified yet, check your email and verify your account first",
        });
      }
      const isMatched = comparePassword(password, user.password);
      if (isMatched) {
        user.password = undefined;
        // jwt
        const jwts = await createJWTs({ email });
        return res.json({
          status: "success",
          message: "logged in successfully",
          user,
          ...jwts,
        });
      } else
        return res.json({
          status: "error",
          message: "Password incorrect !",
        });
    } else
      return res.json({
        status: "error",
        message: "There is no account registered on the email address provided",
      });
  } catch (error) {
    next(error);
  }
});
router.patch("/verify-email", async (req, res, next) => {
  try {
    const { email, emailValidationCode } = req.body;
    const user = await updateOneUser(
      { emailValidationCode, email },
      {
        status: "active",
        emailValidationCode: "",
      }
    );
    user?._id
      ? res.json({
          status: "success",
          message: "Your account has been verified, you may login now",
          user,
        })
      : res.json({
          status: "error",
          message: "invalid or expired link, no action was taken",
        });
  } catch (error) {
    next(error);
  }
});
// generate new accessJWT and send back to the client
router.get("/accessjwt", async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (authorization) {
      // verify token
      const decoded = verifyRefreshJWT(authorization);
      if (decoded.email) {
        // check if exist on db
        const user = await findOneUser({ email: decoded.email });
        if (user?._id) {
          // create new accessJWT and send  to frontend
          return res.json({
            status: "success",
            accessJWT: await signAccessJWT({ email: decoded.email }),
          });
        }
      }
    }
    res.status(401).json({ status: "error", message: "unauthenticated" });
  } catch (error) {
    error.status = 401;
    next(error);
  }
});
export default router;
