import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y password son requeridos' });
    }

    // Buscar usuario
    const [users]: any = await pool.execute(
      `SELECT u.*, r.nombre as rol_nombre 
       FROM usuarios u 
       INNER JOIN roles r ON u.rol_id = r.id 
       WHERE u.email = ? AND u.activo = 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar password (en producción usar bcrypt.compare)
    // Por ahora comparación simple para testing
    if (password !== user.password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Crear token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        rol: user.rol_nombre 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Devolver usuario y token (sin password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { nombre, email, password, rol_id } = req.body;

    // Validar campos
    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const [existingUsers]: any = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash password (en producción)
    // const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword = password; // Por ahora sin hash para testing

    // Crear usuario
    const [result]: any = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol_id]
    );

    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      userId: result.insertId 
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
