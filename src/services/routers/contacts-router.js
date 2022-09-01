import express from "express";
//import { sendRegistrationEmail } from "../../tools/email-tools.js";
import { addDoc } from "firebase/firestore";
import Contacts from "../../../config.js";

const contactsRouter = express.Router();

contactsRouter.post("/", async (req, res, next) => {
  try {
    const data = req.body;

    console.log("req data: ", data);
    await addDoc(Contacts, data);

    res.status(201).send({ msg: "Contact added" });
  } catch (error) {
    next(error);
  }
});

export default contactsRouter;
