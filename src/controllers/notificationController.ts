import { Request, Response } from 'express';
import pool from '../config/database';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const [notifications]: any = await pool.execute(`
      SELECT * FROM notificaciones 
      WHERE usuario_id = ? 
      ORDER BY creada_en DESC
      LIMIT 20
    `, [userId]);

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    await pool.execute(
      'UPDATE notificaciones SET leida = 1 WHERE id = ?',
      [notificationId]
    );

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error actualizando notificación:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};