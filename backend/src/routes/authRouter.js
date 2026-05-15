import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const router = express.Router();

// Standard Auth
router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;
