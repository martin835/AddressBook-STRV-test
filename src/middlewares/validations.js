import { body } from "express-validator";

export const firestoreContactValidation = [
  body("name").exists().withMessage("Name is a mandatory field"),
  body("userId").exists().withMessage("userId is mandatory to save a contact"),
];
