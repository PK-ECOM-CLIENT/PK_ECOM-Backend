import userSchema from "./userSchema.js";
export const insertUser = (obj) => {
  return userSchema(obj).save();
};
export const getSingleUser = (_id) => {
  return userSchema.findById(_id);
};

// export const updateUser = (_id, obj) => {
//   return userSchema.findByIdAndUpdate(_id, obj);
// };
// export const deleteUser = (_id) => {
//   return userSchema.findByIdAndDelete(_id);
// };
