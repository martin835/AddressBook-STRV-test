import express from "express";
import createError from "http-errors";
import { JWTAuthMiddleware } from "../../auth/JWTMiddleware.js";
import { generateAccessToken } from "../../auth/tools.js";
import { validationResult } from "express-validator/src/validation-result.js";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { database } from "../../../config.js";
import UserModel from "../models/user-model.js";
import { firestoreContactValidation } from "../../middlewares/validations.js";
import createHttpError from "http-errors";

const usersRouter = express.Router();

//Endpoint only for testing purposes - delete in prod.
// usersRouter.get("/", async (req, res, next) => {
//   console.log("📨 PING - GET REQUEST");
//   try {
//     const users = await UserModel.find({});

//     res.send(users);
//   } catch (error) {
//     next(error);
//   }
// });

//TEST Creating new user
// usersRouter.post("/", async (req, res, next) => {
//   try {
//     //1. Create new user in MongoDB
//     const newUser = new UserModel(req.body);
//     const { _id } = await newUser.save();

//     res.status(201).send({ _id });
//   } catch (error) {
//     next(error);
//   }
// });

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
    //1 - create a new user in DB
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

    //3. Create collection  with user's ID in Firebase and document "contacts" -> it will be initially empty contact list
    const userId = _id.toString();

    //method used w/o admin SKD:
    //await setDoc(doc(database, userId, userId), {});
    //method used with admin SKD:  https://retool.com/blog/crud-with-cloud-firestore-using-the-nodejs-sdk/
    const newCollection = database.collection(userId);
    const newDocument = newCollection.doc(userId);
    await newDocument.set({});

    // 4. Send access token and _id in the response
    res.status(201).send({ accessToken, _id });
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/me/add-contact",
  JWTAuthMiddleware,
  firestoreContactValidation,
  async (req, res, next) => {
    try {
      const errorsList = validationResult(req);

      if (errorsList.isEmpty()) {
        const user = await UserModel.findById(req.user._id);
        if (user) {
          //If user exists in mongo  -> add contact to collection in firestore
          //ToDo - add check to see if collection / document exists in Firestore

          //method used w/o admin SKD:
          // const { id } = await addDoc(
          //   collection(database, req.user._id),
          //   req.body
          // );

          //method used with admin SKD: https://retool.com/blog/crud-with-cloud-firestore-using-the-nodejs-sdk/
          const myCollection = database.collection(req.user._id);

          const newContact = {
            firstName: req.body.firstName, //required field
            lastName: req.body.lastName ? req.body.lastName : null,
            phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : null,
            email: req.body.email ? req.body.email : null,
            address: req.body.address ? req.body.address : null,
            userId: req.user._id, //this is coming from jwt middleware
          };

          await myCollection.doc().set(newContact);

          res.status(201).send({
            msg: `Contact has been added to the contact list`,
          });
        } else {
          next(createError(401, `User with id ${req.user._id} not found!`));
        }
      } else {
        next(
          createHttpError(400, "Something wrong is with the request body", {
            errorsList,
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;
