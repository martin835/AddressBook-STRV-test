import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String },
    surname: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },

    // role: {
    //   type: String,
    //   required: true,
    //   enum: ["admin", "basicUser"],
    //   default: "basicUser",
    // },
    // verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  // BEFORE saving the user in db, hash the password
  // I haven't used ARROW FUNCTION here because of "this"

  const newUser = this; // "this" here represents the current user I'm trying to save in db
  const plainPW = newUser.password;

  if (newUser.isModified("password")) {
    // only if the user is modifying his password I will use some CPU cycles to hash that, otherwise it's just a waste of time
    const hash = await bcrypt.hash(plainPW, 11);
    newUser.password = hash;
  }

  next();
});

UserSchema.methods.toJSON = function () {
  // EVERY TIME Express does a res.send of users documents, this toJSON function is called

  const userDocument = this;
  const userObject = userDocument.toObject();

  delete userObject.password;
  delete userObject.__v;
  delete userObject.createdAt;
  delete userObject.updatedAt;

  return userObject;
};

UserSchema.statics.checkCredentials = async function (email, plainPassword) {
  //Given email and password, this method should check if email exists in the database, then compare plain password with the hashed one

  // 1. Find user by email
  const user = await this.findOne({ email }); //this refers to the userModel
  if (user) {
    // 2. If user is found => compare plainPW with the hashed one
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (isMatch) {
      //3. If they match --> return a proper response (user)
      return user;
    } else {
      //4. If they don't match --> return null
      return null;
    }
  } else {
    //5. If email is not found --> return null
    return null;
  }
};

//usage --> await UserModel.checkCredentials("john@rambo.com", "1234")

export default model("User", UserSchema);
