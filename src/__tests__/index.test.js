import dotenv from "dotenv";
import mongoose from "mongoose";
import supertest from "supertest";
import app from "../app.js";
import { generateAccessToken } from "../auth/tools";

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
    console.log(
      " ⚠️⚠️⚠️ IMPORTANT - DELETE TEST DATA FROM FIRESTORE DB - THESE DATA ARE CREATED AFTER EVERY TEST"
    );
    console.log(
      " ⚠️⚠️⚠️ IMPORTANT - DELETE TEST DATA FROM FIRESTORE DB - THESE DATA ARE CREATED AFTER EVERY TEST"
    );
    console.log(
      " ⚠️⚠️⚠️ IMPORTANT - DELETE TEST DATA FROM FIRESTORE DB - THESE DATA ARE CREATED AFTER EVERY TEST"
    );
  });

  test("simple check", () => {
    expect(true).toBe(true);
  });

  test("Test endpoint is returning a success message", async () => {
    const response = await client.get("/test");
    expect(response.body.message).toBe("Hello, World!");
  });

  let user = {
    name: "John",
    surname: "Doe",
    email: "john.doe@gmail.com",
    password: "1234asdf",
  };

  //ID is set when registering a new user and used in other login / verify tests
  let userId;

  it("Should register new user, create a new user in Mongo DB, send back access token, user id and 201 status", async () => {
    const response = await client.post("/users/register").send(user);

    expect(response.status).toBe(201);
    expect(response.body.accessToken && response.body._id).toBeDefined();
    userId = response.body._id;
  });

  it("Should login a user with valid email and password", async () => {
    const response = await client
      .post("/users/login")
      .send({ email: "john.doe@gmail.com", password: "1234asdf" });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it("Should NOT login a user with invalid password", async () => {
    const response = await client
      .post("/users/login")
      .send({ email: "john.doe@gmail.com", password: "badpa$$word" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it("Should login me in with valid JWT token", async () => {
    const validToken = await generateAccessToken({
      _id: userId,
    });
    //console.log("🧪 token ", validToken);

    const response = await client
      .get("/users/me")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);

    expect(
      response.body._id &&
        response.body.name &&
        response.body.surname &&
        response.body.email
    ).toBe(userId && user.name && user.surname && user.email);
  });

  it("Should NOT login me in with invalid JWT token", async () => {
    const invalidToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const response = await client
      .get("/users/me")
      .set("Authorization", `Bearer ${invalidToken}`);

    //console.log("🧪 body ", response.body);
    expect(response.status).toBe(401);

    expect(response.body.message).toBe("Token is not valid!");
  });

  let newContact = {
    name: "Jane",
    surname: "Doe",
    phoneNumber: "+421515135132",
    address: "42 Lexington Ave, NY, NY",
    userId: "test",
  };

  it("Should log me in with valid JWT and add new contact to firestore DB", async () => {
    const validToken = await generateAccessToken({
      _id: userId,
    });

    const response = await client
      .post("/users/me/add-contact")
      .set("Authorization", `Bearer ${validToken}`)
      .send({ ...newContact, test: true });

    expect(response.status).toBe(201);
  });
});
