import jwt from "jsonwebtoken";
//function to genrerate token for a user
export const genrerateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  return token;
};
