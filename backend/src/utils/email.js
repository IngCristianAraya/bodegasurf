const nodemailer = require('nodemailer');
const { 
  EMAIL_HOST, 
  EMAIL_PORT, 
  EMAIL_SECURE, 
  EMAIL_USERNAME, 
  EMAIL_PASSWORD, 
  EMAIL_FROM 
} = require('../config/config');

// Crear un transportador de correo reutilizable
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE, // true para 465, false para otros puertos
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Enviar un correo electrónico
 * @param {Object} options - Opciones del correo
 * @param {string} options.to - Dirección de correo del destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.text - Cuerpo del correo en texto plano
 * @param {string} [options.html] - Cuerpo del correo en HTML (opcional)
 * @returns {Promise} Promesa que se resuelve cuando se envía el correo
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Configurar las opciones del correo
    const mailOptions = {
      from: EMAIL_FROM,
      to,
      subject,
      text,
      html: html || text, // Usar HTML si está disponible, de lo contrario usar texto plano
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw new Error('No se pudo enviar el correo electrónico');
  }
};

/**
 * Enviar correo de restablecimiento de contraseña
 * @param {string} email - Correo del destinatario
 * @param {string} resetToken - Token de restablecimiento
 * @param {string} resetUrl - URL para restablecer la contraseña
 * @returns {Promise} Promesa que se resuelve cuando se envía el correo
 */
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  const subject = 'Restablecer tu contraseña';
  const text = `Recibiste este correo porque tú (o alguien más) ha solicitado restablecer la contraseña de tu cuenta.\n\n` +
    `Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso:\n\n` +
    `${resetUrl}?token=${resetToken}\n\n` +
    `Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.\n`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-top: 0;">Restablecer tu contraseña</h2>
        <p>Hola,</p>
        <p>Recibiste este correo porque tú (o alguien más) ha solicitado restablecer la contraseña de tu cuenta.</p>
        <p>Por favor, haz clic en el siguiente botón para completar el proceso:</p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}?token=${resetToken}" 
             style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer contraseña
          </a>
        </div>
        <p>O copia y pega la siguiente URL en tu navegador:</p>
        <p style="word-break: break-all; color: #3498db;">${resetUrl}?token=${resetToken}</p>
        <p>Si no solicitaste esto, ignora este correo y tu contraseña permanecerá sin cambios.</p>
        <p>Atentamente,<br>El equipo de Ventas Bodega</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

/**
 * Enviar correo de confirmación de registro
 * @param {string} email - Correo del destinatario
 * @param {string} userName - Nombre del usuario
 * @returns {Promise} Promesa que se resuelve cuando se envía el correo
 */
const sendWelcomeEmail = async (email, userName) => {
  const subject = '¡Bienvenido a Ventas Bodega!';
  const text = `Hola ${userName},\n\n` +
    `¡Gracias por registrarte en Ventas Bodega! Tu cuenta ha sido creada exitosamente.\n\n` +
    `Ahora puedes iniciar sesión y comenzar a utilizar nuestra plataforma.\n\n` +
    `Si tienes alguna pregunta, no dudes en contactarnos.\n\n` +
    `¡Bienvenido a bordo!\n\n` +
    `Atentamente,\nEl equipo de Ventas Bodega`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #e9ecef;">
        <h2 style="color: #2c3e50; margin-top: 0;">¡Bienvenido a Ventas Bodega, ${userName}!</h2>
        <p>Gracias por registrarte en nuestra plataforma. Tu cuenta ha sido creada exitosamente.</p>
        <p>Ahora puedes iniciar sesión y comenzar a utilizar todas las funcionalidades disponibles.</p>
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
        <p>¡Bienvenido a bordo!</p>
        <p>Atentamente,<br>El equipo de Ventas Bodega</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  transporter
};
