# Subscription Backend (Netflix-style)

## Features
- JWT authentication with refresh tokens
- Multi-device login with device limits
- Logout single device / all devices
- Redis-based rate limiting (Upstash)
- Protected content APIs

## Tech Stack
- Node.js (Express)
- MySQL
- Redis (Upstash)
- JWT

## Security
- Password hashing (bcrypt)
- Token rotation
- Rate limiting

## Setup
1. Clone repo
2. Install deps: npm install
3. Create .env
4. Run: npm run dev
