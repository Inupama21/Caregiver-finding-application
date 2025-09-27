import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";

export const createAccessToken = (user: { id: number; email: string; userType?: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, userType: user.userType },
    JWT_SECRET,
    { expiresIn: "15m" } 
  );
};

export const createRefreshToken = (user: { id: number; userType?: string }) => {
  return jwt.sign(
    { id: user.id, userType: user.userType },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" } 
  );
};