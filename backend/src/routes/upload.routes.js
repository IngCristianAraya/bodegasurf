import express from 'express';
import { uploadProductImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js'; // Asumiendo que la subida de imágenes debe ser protegida

const router = express.Router();

// Ruta para subir imagen de producto
// POST /api/v1/uploads/image
router.post(
    '/image',
    protect, // Proteger la ruta, solo usuarios autenticados pueden subir
    uploadProductImage
);

export default router; 