import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const signToken = (user) =>
  jwt.sign({ sub: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || "development-secret", {
    expiresIn: "7d"
  });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please provide a name and valid email address." });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }
    if (await User.findOne({ email: email.trim().toLowerCase() })) {
      return res.status(409).json({ message: "An account already exists with this email." });
    }
    const user = await User.create({ name: name.trim(), email: email.trim(), password });
    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

export default router;
