import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    duplicate: {
      type: Boolean,
      default: true,
    },
    filter: {
      type: String,
      default: "",
    },
    count: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("cart", cartSchema);
