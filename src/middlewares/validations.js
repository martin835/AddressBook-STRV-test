import { body } from "express-validator";

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
