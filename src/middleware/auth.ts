import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token recibido:', token); // Para debug

  if (!token) {
    console.log('Token no proporcionado');
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      console.log('Token inválido:', err);
      return res.status(403).json({ message: 'Token inválido' });
    }
    (req as any).user = user;
    next();
  });
};