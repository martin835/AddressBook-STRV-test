import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../auth/tools";

dotenv.config();

describe("Testing auth functions", () => {
  const userId = {
    _id: "123455",
  };

  it("Should create a valid jwt token", async () => {
    const token = await generateAccessToken(userId);

    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toBeDefined();
  });
});
