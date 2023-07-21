import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  status: {
    type: String,
    default: "inactive",
  },
  firstName: {
    type: String,
    maxLength: [20, "User first name can't be longer than 20 character"],
    required: true,
  },
  lastName: {
    type: String,
    maxLength: [20, "User Last name can't be longer than 20 character"],
    required: true,
  },
  email: {
    type: String,
    unique: true,
    index: 1,
    maxLength: [50, "User email address can't be longer than 50 character"],
    required: true,
  },
  emailValidationCode: {
    type: String,
    default: "",
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    maxLength: [10, "Phone number can't be longer than 10 character"],
    required: true,
  },
  dob: {
    type: Date,
    default: null,
  },
  address: {
    streetAddress: {
      type: String,
      maxlength: [50, "Street address can't be longer than 50 character"],
      required: true,
    },
    suburb: {
      type: String,
      maxlength: [20, "Suburb can't be longer than 20 character"],
      required: true,
    },
    state: {
      type: String,
      maxlength: [15, "State can't be longer than 15 character"],
      required: true,
    },
    postCode: {
      type: Number,
      maxlength: [8, "Postcode can't be longer than 8 character"],
      required: true,
    },
  },
});
export default mongoose.model("user", userSchema);
