import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { userId, logoutVersion } = payload;

    // check logout-all
    const [users] = await pool.query(
      'SELECT logout_version FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (users[0].logout_version !== logoutVersion) {
      return res.status(401).json({ message: 'Logged out from all devices' });
    }

    req.user = { id: userId };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
