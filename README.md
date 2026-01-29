# 🎬 Subscription-Based Backend Platform (Netflix / Hotstar Style)

A production-grade backend service for a subscription-based content platform, inspired by **Netflix / Hotstar**, built with **Node.js**, **MySQL**, and **Redis**.

This project focuses on **authentication, security, scalability, and multi-device session management**.

---

## 🚀 Features

### 👤 User & Subscription Management
- ✅ User signup & login with email + password
- ✅ Login from multiple devices
- ✅ Device / screen limits based on subscription plan
- ✅ Automatic block when device limit is exceeded

### 🔐 Authentication & Authorization
- ✅ JWT **access token** + **refresh token**
- ✅ Secure refresh token **rotation**
- ✅ Refresh token stored as **hashed value**
- ✅ Logout from:
  - Single device
  - All devices (global logout)
- ✅ Token invalidation using `logout_version`

### 🎥 Protected Content
- ✅ Access protected content only with valid JWT
- ✅ Unauthorized requests are blocked
- ✅ Netflix-style middleware-based protection

### 🛡️ Security
- ✅ Password hashing using **bcrypt**
- ✅ Prevention of refresh token reuse
- ✅ Secure secrets handling using environment variables
- ✅ No secrets committed to GitHub

### 🚦 Rate Limiting (Redis)
- ✅ Redis-based rate limiting (Upstash – Cloud Redis)
- ✅ Login API protected against brute-force attacks
- ✅ Content API protected against abuse
- ✅ Returns `429 Too Many Requests` when limit exceeded

---

## 🧱 Tech Stack

| Layer | Technology |
|-----|-----------|
Backend | Node.js (Express, ES Modules) |
Database | MySQL |
Caching / Rate Limiting | Redis (Upstash – Cloud) |
Authentication | JWT (Access + Refresh Tokens) |
Security | bcrypt, token rotation |

---

## 🔄 Authentication Flow (High Level)

1. User logs in with email & password
2. Server issues:
   - Short-lived **Access Token**
   - Long-lived **Refresh Token**
3. Refresh token is:
   - Stored as **hashed**
   - Rotated on every refresh
4. Logout-all increments `logout_version` → invalidates all tokens

---

## 🚦 Rate Limiting Strategy

- **Login API**
  - 5 requests / 10 minutes
- **Content API**
  - 100 requests / minute
- Implemented using **Redis atomic counters**
- Cloud Redis used (Upstash) — no local setup required

---

## Setup
1. Clone repo
2. Install deps: npm install
3. Create .env
4. Run: npm run dev
