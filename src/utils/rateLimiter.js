import redis from '../config/redis.js';

export const rateLimiter = ({
  windowSeconds,
  maxRequests,
  keyPrefix
}) => {
  return async (req, res, next) => {
    try {
      const identifier =
        req.ip || req.headers['x-forwarded-for'];

      const key = `${keyPrefix}:${identifier}`;

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        return res.status(429).json({
          message: 'Too many requests. Please try again later.'
        });
      }

      next();
    } catch (err) {
      console.error('Rate limit error:', err);
      next(); // fail-open
    }
  };
};
