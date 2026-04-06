import jwt from "jsonwebtoken";
import { env } from "./env.js";
import type { Request, Response, NextFunction } from "express";

export type AdminJwtPayload = {
  role: "admin";
};

export function signAdminToken() {
  const payload: AdminJwtPayload = { role: "admin" };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
    if (decoded?.role !== "admin") return res.status(403).json({ error: "Forbidden" });
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

