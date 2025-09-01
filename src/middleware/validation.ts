import { Request, Response, NextFunction } from 'express';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y password son requeridos' });
  }

  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Email debe ser válido' });
  }

  next();
};