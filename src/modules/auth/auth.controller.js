import {
  loginUser,
  signupUser,
  refreshToken,
  logoutDevice,
  logoutAllDevices
} from './auth.service.js';

/* ===================== SIGNUP ===================== */
export const signup = async (req, res) => {
  try {
    const user = await signupUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===================== LOGIN ===================== */
export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body, req.headers);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===================== REFRESH TOKEN ===================== */
export const refresh = async (req, res) => {
  try {
    const result = await refreshToken(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

/* ===================== LOGOUT (SINGLE DEVICE) ===================== */
export const logout = async (req, res) => {
  try {
    await logoutDevice(req.body);
    res.json({ message: 'Logged out from device' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ===================== LOGOUT (ALL DEVICES) ===================== */
export const logoutAll = async (req, res) => {
  try {
    await logoutAllDevices(req.body);
    res.json({ message: 'Logged out from all devices' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
