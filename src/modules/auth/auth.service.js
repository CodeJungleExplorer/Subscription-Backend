import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken
} from '../../utils/jwt.js';

/* ===================== SIGNUP ===================== */
export const signupUser = async ({ email, password, plan = 'BASIC' }) => {
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existing.length) {
    throw new Error('User already exists');
  }

  const [plans] = await pool.query(
    'SELECT id FROM subscription_plans WHERE name = ?',
    [plan]
  );

  if (!plans.length) {
    throw new Error('Invalid subscription plan');
  }

  const passwordHash = await hashPassword(password);

  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, plan_id) VALUES (?, ?, ?)',
    [email, passwordHash, plans[0].id]
  );

  return {
    id: result.insertId,
    email,
    plan
  };
};

/* ===================== LOGIN ===================== */
export const loginUser = async (body, headers) => {
  const { email, password } = body;

  const [users] = await pool.query(
    `SELECT u.*, s.max_devices
     FROM users u
     JOIN subscription_plans s ON u.plan_id = s.id
     WHERE u.email = ?`,
    [email]
  );

  if (!users.length) {
    throw new Error('User not found');
  }

  const user = users[0];

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const deviceId = headers['x-device-id'] || uuidv4();

  const [sessions] = await pool.query(
    'SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ?',
    [user.id]
  );

  if (sessions[0].count >= user.max_devices) {
    throw new Error('Device limit reached');
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    logoutVersion: user.logout_version
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    deviceId
  });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await pool.query(
    `INSERT INTO user_sessions
     (user_id, device_id, refresh_token_hash, logout_version)
     VALUES (?, ?, ?, ?)`,
    [user.id, deviceId, refreshTokenHash, user.logout_version]
  );

  return {
    accessToken,
    refreshToken,
    deviceId
  };
};

/* ===================== REFRESH TOKEN ===================== */
export const refreshToken = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new Error('Refresh token missing');
  }

  const payload = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const { userId, deviceId } = payload;

  const [sessions] = await pool.query(
    'SELECT * FROM user_sessions WHERE user_id = ? AND device_id = ?',
    [userId, deviceId]
  );

  if (!sessions.length) {
    throw new Error('Session not found');
  }

  const session = sessions[0];

  const valid = await bcrypt.compare(
    refreshToken,
    session.refresh_token_hash
  );

  if (!valid) {
    // 🔥 Token reuse detected
    await pool.query(
      'DELETE FROM user_sessions WHERE user_id = ?',
      [userId]
    );
    throw new Error('Token reuse detected. Logged out everywhere.');
  }

  const newAccessToken = generateAccessToken({
    userId,
    logoutVersion: session.logout_version
  });

  const newRefreshToken = generateRefreshToken({
    userId,
    deviceId
  });

  const newHash = await bcrypt.hash(newRefreshToken, 10);

  await pool.query(
    'UPDATE user_sessions SET refresh_token_hash = ? WHERE id = ?',
    [newHash, session.id]
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

/* ===================== LOGOUT (SINGLE DEVICE) ===================== */
export const logoutDevice = async ({ userId, deviceId }) => {
  if (!userId || !deviceId) {
    throw new Error('userId and deviceId required');
  }

  await pool.query(
    'DELETE FROM user_sessions WHERE user_id = ? AND device_id = ?',
    [userId, deviceId]
  );
};

/* ===================== LOGOUT (ALL DEVICES) ===================== */
export const logoutAllDevices = async ({ userId }) => {
  if (!userId) {
    throw new Error('userId required');
  }

  await pool.query(
    'UPDATE users SET logout_version = logout_version + 1 WHERE id = ?',
    [userId]
  );

  await pool.query(
    'DELETE FROM user_sessions WHERE user_id = ?',
    [userId]
  );
};
