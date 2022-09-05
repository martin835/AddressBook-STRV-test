import express from "express";
import { validationResult } from "express-validator/src/validation-result.js";
import createError from "http-errors";
import { JWTAuthMiddleware } from "../../auth/JWTMiddleware.js";
import { generateAccessToken } from "../../auth/tools.js";
import createHttpError from "http-errors";
import { database } from "../../../config.js";
import {
  firestoreContactValidation,
  newUserValidation,
} from "../../middlewares/validations.js";
import UserModel from "../models/user-model.js";

const usersRouter = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *   User:
 *      type: object
 *      required:
 *          - email
 *          - password
 *      properties:
 *          email:
 *              type: string
 *              description: User's email for registration. Must be unique in the DB
 *          password:
 *              type: string
 *              description: Provide strong password. minLength is 8, minLowercase is 1, minUppercase is 1, minNumbers is 1, minSymbols is 1
 *          name:
 *              type: string
 *              description: Optional - user's first name.
 *          surname:
 *              type: string
 *              description: Optional - user's surname.
 *          _id:
 *              type: string
 *              description: The auto-generated id
 *      example:
 *          email: new@gmail.com
 *          password: 1234@%%SFD23ff5
 *          name: John
 *          surname: Doe
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - firstName
 *       properties:
 *         firstName:
 *           type: string
 *           description: First name of the contact
 *         lastName:
 *           type: string
 *           description: Surname name of the contact
 *         email:
 *           type: string
 *           description: The email address of the contact
 *         address:
 *           type: string
 *           description: The address of the contact
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the contact
 *         id:
 *           type: string
 *           description: The auto-generated id of the contact
 *         userId:
 *           type: string
 *           description: The auto-generated id of the user who added the contact
 *       example:
 *           phoneNumber: 123325325234,
 *           firstName: Jane,
 *           lastName : Test2,
 *           email: sadare@sdasd.com,
 *           address: 42 Lexington Ave, NY, NY
 */

/**
 * @swagger
 * components:
 *  securitySchemes:
 *   Bearer:
 *     type: apiKey
 *     in: header
 *     name: authentication
 *     bearerFormat: JWT
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     description: Log's user in if valid token is provided
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: OK - returning user's information
 *         content:
 *            object:
 *              schema:
 *                 properties:
 *                     email:
 *                      type: string
 *                      description: User's email
 *                     _id:
 *                      type: string
 *                      description: User's id
 *                     name:
 *                      type: string
 *                      description: User's name - if provided
 *                     surname:
 *                      type: string
 *                      description: User's surname - if provided
 *       401:
 *          description: User has not been found by provided token.
 *          content:
 *             text/plain:
 *                  schema:
 *                      type: string
 *                      example: User with id 234ghvf08d028vh20fv not found!
 *       500:
 *          description: Generic server error
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 */
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

/**
 * @swagger
 * /users/login:
 *   post:
 *     description: Login an existing user
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     requestBody:
 *         description: Checks if provided email is in the database and checks if provided password is correct.
 *         required: true
 *         content:
 *              application/json:
 *                  schema:
 *                     properties:
 *                        email:
 *                          type: string
 *                          description: User's valid email.
 *                        password:
 *                          type: string
 *                          description: User's valid password.
 *     responses:
 *       200:
 *         description: User successfully logged in.
 *         content:
 *            object:
 *              schema:
 *                 properties:
 *                     accessToken:
 *                      type: string
 *                      description: jwt token
 *       401:
 *          description: Wrong credentials provided.
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 *       500:
 *          description: Generic server error
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 */

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

/**
 * @swagger
 * /users/register:
 *   post:
 *     description: Register a new user
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     requestBody:
 *         description: Save a new user in the DB. Email must be unique.
 *         required: true
 *         content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: New user created in the DB.
 *         content:
 *            object:
 *              schema:
 *                 properties:
 *                     accessToken:
 *                      type: string
 *                      description: jwt token
 *                     _id:
 *                      type: string
 *                      description: unique user's id
 *       400:
 *          description: Something is wrong with the req body. Probably input validation error. Check errors list object.
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 *       500:
 *          description: Generic server error
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 */

usersRouter.post("/register", newUserValidation, async (req, res, next) => {
  //console.log(req.body);
  try {
    const errorsList = validationResult(req);

    if (errorsList.isEmpty()) {
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
});

/**
 * @swagger
 * /users/me/add-contact:
 *   post:
 *     description: Creates new contact in user's collection of contacts in Firestore.
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     requestBody:
 *         description: Save a new contact in the DB. userId is extracted from jwt token.
 *         required: true
 *         content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: New user created in the DB.
 *         content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Contact has been added to the contact list
 *       401:
 *          description: Either user or user's collection of contacts has not been found by user's id.
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 *       500:
 *          description: Generic server error
 *          content:
 *            object:
 *              schema:
 *                 properties:
 *                     message:
 *                      type: string
 *                      description: Error message
 */

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
          //Check to see if collection / document exists in Firestore
          const checkMyCollection = await database
            .collection(req.user._id)
            .get();
          //console.log("My collection: ", checkMyCollection._size);

          if (checkMyCollection._size > 0) {
            //proceed only if collection with my id exists in firestore

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
              message: `Contact has been added to the contact list`,
            });
          } else {
            next(
              createError(
                401,
                `Collection ${req.user._id} not found! Cannot save the contact`
              )
            );
          }
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
