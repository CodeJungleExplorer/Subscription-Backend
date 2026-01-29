import express from 'express';
import {
  login,
  signup,
  refresh,
  logout,
  logoutAll
} from './auth.controller.js';
import { rateLimiter } from '../../utils/rateLimiter.js';

const router = express.Router();


/* 🔐 LOGIN – rate limited */
router.post(
  '/login',
  rateLimiter({
    windowSeconds: 10 * 60, // 10 minutes
    maxRequests: 5,
    keyPrefix: 'login'
  }),
  login
);
router.post('/signup', signup);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);

export default router;
