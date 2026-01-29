import express from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import contentRoutes from './modules/content/content.routes.js';

const app = express();

// ✅ ONLY THIS JSON PARSER
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/content', contentRoutes);

export default app;
