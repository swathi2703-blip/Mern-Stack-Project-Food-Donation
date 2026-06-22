import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null;
    const token = bearerToken || req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not authorized" });
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};
