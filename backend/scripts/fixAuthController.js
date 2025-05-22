import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const authControllerPath = join(__dirname, '..', 'src', 'controllers', 'authController.js');

// Leer el contenido actual del archivo
try {
  const data = await readFile(authControllerPath, 'utf8');

  // Reemplazar la configuración de la cookie
  const updatedContent = data.replace(
    /const cookieOptions = \{\s*expires: new Date\(\s*Date\.now\(\) \+ \(process\.env\.JWT_COOKIE_EXPIRE \|\| 30\) \* 24 \* 60 \* 60 \* 1000\s*\)\s*,\s*httpOnly: true\s*,\s*secure: process\.env\.NODE_ENV === 'production'\s*\};/,
    `const cookieDays = parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10);
    const cookieOptions = {
      expires: new Date(
        Date.now() + (cookieDays * 24 * 60 * 60 * 1000)
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    };`
  );

  // Escribir el contenido actualizado
  await writeFile(authControllerPath, updatedContent, 'utf8');
  console.log('Archivo actualizado correctamente');
} catch (err) {
  console.error('Error al procesar el archivo:', err);
}
