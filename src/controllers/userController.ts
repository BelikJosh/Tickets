import { Request, Response } from 'express';
import pool from '../config/database';

export const getUsers = async (req: Request, res: Response) => {
  try {
    console.log('Obteniendo usuarios...');
    const [users]: any = await pool.execute(`
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      INNER JOIN roles r ON u.rol_id = r.id 
      WHERE u.activo = 1
    `);

    // Ocultar passwords
    const usersWithoutPassword = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    console.log('Usuarios encontrados:', usersWithoutPassword.length);
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const [users]: any = await pool.execute(`
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      INNER JOIN roles r ON u.rol_id = r.id 
      WHERE u.id = ? AND u.activo = 1
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { password, ...userWithoutPassword } = users[0];
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
// Subir foto de perfil
export const uploadUserPhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { foto, foto_tipo } = req.body;

    if (!foto || !foto_tipo) {
      return res.status(400).json({ message: 'Foto y tipo de foto son requeridos' });
    }

    // Convertir base64 a buffer
    const fotoBuffer = Buffer.from(foto, 'base64');

    await pool.execute(
      'UPDATE usuarios SET foto = ?, foto_tipo = ? WHERE id = ?',
      [fotoBuffer, foto_tipo, userId]
    );

    res.json({ message: 'Foto actualizada exitosamente' });
  } catch (error) {
    console.error('Error subiendo foto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener foto de perfil
export const getUserPhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [users]: any = await pool.execute(
      'SELECT foto, foto_tipo FROM usuarios WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].foto) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    const user = users[0];
    
    // Convertir buffer a base64
    const fotoBase64 = user.foto.toString('base64');
    
    res.json({
      foto: fotoBase64,
      foto_tipo: user.foto_tipo
    });
  } catch (error) {
    console.error('Error obteniendo foto:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener usuario con foto
export const getUserWithPhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const [users]: any = await pool.execute(
      `SELECT u.*, r.nombre as rol_nombre,
              CASE WHEN u.foto IS NOT NULL THEN true ELSE false END as tiene_foto
       FROM usuarios u 
       INNER JOIN roles r ON u.rol_id = r.id 
       WHERE u.id = ? AND u.activo = 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];
    
    // Ocultar password y foto binaria
    const { password, foto, ...userWithoutSensitive } = user;
    
    res.json(userWithoutSensitive);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};