import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";

const router = express.Router();

//here we take (username, email, password to create user and send it to mongodb)
router.post("/register", register)

//we take username and password to check the user
router.post("/login", login)

router.post("/logout", logout)

export default router