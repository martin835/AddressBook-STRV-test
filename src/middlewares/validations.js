import { body } from "express-validator";
import UserModel from "../services/models/user-model.js";

export const firestoreContactValidation = [
  body("firstName")
    .exists()
    .isString()
    .withMessage("Name is a mandatory field"),
  body("email").isEmail().optional(),
  body("address").isString().optional(),
  body("phoneNumber").isMobilePhone().optional(),
  body("lastName").isString().optional(),
];

export const newUserValidation = [
  body("name").isString().optional(),
  body("surname").isString().optional(),
  body("password")
    .isStrongPassword()
    .withMessage(
      "Password is a mandatory field. Provide strong password: minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1"
    ),
  body("email")
    .isEmail()
    .withMessage("Email is a mandatory field")
    .custom((value, { req }) => {
      return new Promise((resolve, reject) => {
        UserModel.findOne(
          { email: req.body.email.toLowerCase() },
          function (err, user) {
            if (err) {
              reject(new Error("Server Error"));
            }
            if (Boolean(user)) {
              reject(new Error("This e-mail is already registered."));
            }
            resolve(true);
          }
        );
      });
    }),
];

export const loginValidation = [
  body("password").exists().withMessage("Password is a mandatory field."),
  body("email").exists().isEmail().withMessage("Email is a mandatory field"),
];
