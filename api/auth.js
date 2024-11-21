const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

function createToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1d" });
}

router.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (!token) return next();

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUniqueOrThrow({ where: { id }});
    req.user = user
    next();
  } catch (error) {
    next({ status: 401, message: `Not logged in` });
  }
});

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashedPassword } });
    const token = createToken(user.id);
    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { username } });
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw { status: 401, message: "Invalid Password" };
    }

    const token = createToken(user.id);
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

function authenticate(req, res, next) {
  if (req.user) {
    return next();
  }
  next({ status: 401, message: "You must be logged in." });
}

module.exports = { router, authenticate };