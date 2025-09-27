// middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// This is a good practice for TypeScript to add the user property to the Request object
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    // Return 401 if no authorization header is provided
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({ message: "Invalid token format" });
    return;
  }

  try {
    // Verify the token using the secret
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    // If the token is invalid or expired, return 403 Forbidden.
    // This status code tells the client to try to refresh the token.
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};