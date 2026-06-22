import express from 'express';
import { register, login, logout, googleLogin, forgotPassword } from '../controllers/authController.js';
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const router = express.Router();

// Standard Auth
router.post('/signup', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);

export default router;
