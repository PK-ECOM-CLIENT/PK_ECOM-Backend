import SessionSchema from "./sessionSchema.js";
export const insertSession = (obj) => {
  return SessionSchema(obj).save();
};

// filter must be an object
export const getSession = (filter) => {
  return SessionSchema.findOne(filter);
};
// filter must be an object
export const deleteSession = (filter) => {
  return SessionSchema.findOneAndDelete(filter);
};
