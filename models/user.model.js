import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    prac_attempts: {
      type: Number,
      default: 0,
    },
    prac_rating: {
        type: Number,
        default: 0,
    },
    mock_attempts: {
        type: Number,
        default: 0,
    },
    mock_rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
