import express from 'express';
import bodyParser from 'body-parser';
import { authMiddleware } from './existing/auth';
import managementRoutes from './server/routes/management';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(authMiddleware);

// Routes
app.use('/api/management', managementRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});