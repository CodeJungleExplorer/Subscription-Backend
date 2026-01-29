import express from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import { getContent } from './content.controller.js';
import { rateLimiter } from '../../utils/rateLimiter.js';

const router = express.Router();

router.get(
  '/videos',
  rateLimiter({
    windowSeconds: 60, // 1 minute
    maxRequests: 100,
    keyPrefix: 'content'
  }),
  authenticate,
  getContent
);

export default router;
