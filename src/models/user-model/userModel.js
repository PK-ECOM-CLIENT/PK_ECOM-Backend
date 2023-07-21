import userSchema from "./userSchema.js";
export const insertUser = (obj) => {
  return userSchema(obj).save();
};
export const findOneUser = (filter) => {
  return userSchema.findOne(filter);
};
export const updateOneUser = (filter, update) => {
  return userSchema.findOneAndUpdate(filter, update, { new: true });
};
// export const updateUser = (_id, obj) => {
//   return userSchema.findByIdAndUpdate(_id, obj);
// };
// export const deleteUser = (_id) => {
//   return userSchema.findByIdAndDelete(_id);
// };
