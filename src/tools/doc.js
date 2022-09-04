import swaggerJSDoc from "swagger-jsdoc";

//API Documentation

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "STRV AddressBook",
      version: "1.0.0",
      description:
        "REST api for storing users and storing and reading contacts.",
    },
    servers: [{ url: `${process.env.BE_URL}${process.env.PORT}` }],
  },
  apis: ["./src/services/routers/*.js"],
};

export const specs = swaggerJSDoc(options);
