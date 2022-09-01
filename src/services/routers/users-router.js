import express from "express";
import createError from "http-errors";
import { JWTAuthMiddleware } from "../../auth/JWTMiddleware.js";
import { generateAccessToken } from "../../auth/tools.js";
//import { sendRegistrationEmail } from "../../tools/email-tools.js";
import UserModel from "../models/user-model.js";

const usersRouter = express.Router();

usersRouter.get("/", async (req, res, next) => {
  console.log("📨 PING - GET REQUEST");
  try {
    const users = await UserModel.find({});

    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/", async (req, res, next) => {
  console.log("📨 PING - POST REQUEST");
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
    res.status(201).send({ _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(createError(401, `User with id ${req.user._id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  //console.log(req.body);
  try {
    //1. Obtain credentials from req.body
    const { email, password } = req.body;

    //2. Verify credentials
    const user = await UserModel.checkCredentials(email, password);
    //console.log(user);
    if (user) {
      const accessToken = await generateAccessToken({
        _id: user._id,
      });
      res.send({ accessToken });
    } else {
      next(createError(401, `Wrong login / registration credentials!`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  //console.log(req.body);
  try {
    //1 - create a new user in DB, verification status =  verified:false (default)
    const newUser = new UserModel({
      ...req.body,
    });

    const { _id, email, name } = await newUser.save();
    // 2. Generate access token
    // KEYS _id and role are send as a payload to `generateAcccessToken function, that...
    //.. creates a JWT token out of it.
    //VALUES _id and role are retrieved from user in the DB
    const accessToken = await generateAccessToken({
      _id: _id,
    });
    // 3 Send access token and _id in the response
    res.status(201).send({ accessToken, _id });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;