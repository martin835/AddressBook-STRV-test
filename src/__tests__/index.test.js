import dotenv from "dotenv";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";

dotenv.config();

const client = supertest(app);

describe("Testing the enviroment", () => {
  beforeAll(async () => {
    console.log("🧪 Before all");
    await mongoose.connect(process.env.MONGO_URL_TEST);
  });

  afterAll(async () => {
    console.log("🧪 After all");
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test("simple check", () => {
    expect(true).toBe(true);
  });

  test("Test endpoint is returning a success message", async () => {
    const response = await client.get("/test");
    expect(response.body.message).toBe("Hello, World!");
  });
});
