import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '../errors/index.js';

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__basedir, 'public', 'uploads', 'images');
        // Asegurarse de que el directorio de subida exista
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Crear un nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Filtro de archivos para aceptar solo imágenes
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Por favor, sube solo archivos de imagen (jpeg, png, gif, webp).'), false);
    }
};

// Configurar Multer con el almacenamiento y el filtro
const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB por archivo
    }
}).single('image'); // 'image' debe ser el nombre del campo en el FormData del frontend

export const uploadProductImage = (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Un error de Multer ocurrió durante la subida.
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'El archivo es demasiado grande. Límite de 5MB.' });
            }
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: err.message });
        }
        if (err) {
            // Un error desconocido ocurrió.
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message || 'Error al subir la imagen.' });
        }

        // Todo salió bien, el archivo se subió.
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'No se seleccionó ningún archivo para subir.' });
        }

        // Construir la URL de la imagen subida
        // La URL será relativa a la raíz del servidor, ya que 'public' se sirve estáticamente.
        const imageUrl = `/uploads/images/${req.file.filename}`;

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Imagen subida exitosamente',
            data: {
                url: imageUrl,
                filename: req.file.filename
                // public_id no es relevante para el almacenamiento local, pero lo mantenemos en la estructura por si se migra a Cloudinary
                // public_id: req.file.filename 
            }
        });
    });
}; 