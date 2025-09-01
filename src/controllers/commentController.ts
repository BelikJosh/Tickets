import { Request, Response } from 'express';
import pool from '../config/database';

export const getCommentsByTicket = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    
    const [comments]: any = await pool.execute(`
      SELECT c.*, u.nombre as usuario_nombre, u.rol_id
      FROM comentarios_tickets c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.creado_en ASC
    `, [ticketId]);

    res.json(comments);
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    const { usuario_id, comentario } = req.body;

    const [result]: any = await pool.execute(
      'INSERT INTO comentarios_tickets (ticket_id, usuario_id, comentario) VALUES (?, ?, ?)',
      [ticketId, usuario_id, comentario]
    );

    // Crear notificación
    await pool.execute(
      'INSERT INTO notificaciones (usuario_id, mensaje, tipo) VALUES (?, ?, ?)',
      [usuario_id, 'Nuevo comentario agregado', 'info']
    );

    res.status(201).json({ 
      message: 'Comentario creado exitosamente',
      commentId: result.insertId
    });
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};