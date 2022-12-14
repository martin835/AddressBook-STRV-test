import cors from "cors";
import express from "express";
import usersRouter from "./services/routers/users-router.js";
import morgan from "morgan";
import swaggerUI from "swagger-ui-express";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHandler,
  notFoundHandler,
  unauthorizedHandler,
} from "./errorHandlers.js";
import { specs } from "./tools/doc.js";

const app = express();

//***********************************Middlewares*******************************************************/

// const whitelist = [
//   process.env.FE_DEV_URL,
//   process.env.FE_PROD_URL,
//   process.env.REDIRECT,
// ];

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

//***********************************Endpoints*********************************************************/

app.use("/users", usersRouter);

// For test purposes
app.get("/test", (req, res) => {
  res.send({ message: "Hello, World!" });
});

//For generating documentation
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

//***********************************Error handlers****************************************************/

app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(forbiddenHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

export default app;
