import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route working' });
});

export default router; 