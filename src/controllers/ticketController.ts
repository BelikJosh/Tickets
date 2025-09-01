import { Request, Response } from 'express';
import pool from '../config/database';

export const getTickets = async (req: Request, res: Response) => {
  try {
    console.log('Obteniendo tickets...');
    const [tickets]: any = await pool.execute(`
      SELECT t.*, 
             s.nombre as solicitante_nombre,
             a.nombre as asignado_nombre
      FROM tickets t
      LEFT JOIN usuarios s ON t.solicitante_id = s.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      ORDER BY t.creado_en DESC
    `);
    
    console.log('Tickets encontrados:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const createTicket = async (req: Request, res: Response) => {
  try {
    console.log('Creando ticket:', req.body);
    const { titulo, descripcion, prioridad, solicitante_id } = req.body;

    const [result]: any = await pool.execute(
      'INSERT INTO tickets (titulo, descripcion, prioridad, solicitante_id, estado) VALUES (?, ?, ?, ?, "nuevo")',
      [titulo, descripcion, prioridad, solicitante_id]
    );

    // Obtener el ticket recién creado
    const [newTicket]: any = await pool.execute(`
      SELECT t.*, s.nombre as solicitante_nombre 
      FROM tickets t 
      LEFT JOIN usuarios s ON t.solicitante_id = s.id 
      WHERE t.id = ?
    `, [result.insertId]);

    console.log('Ticket creado con ID:', result.insertId);
    res.status(201).json({ 
      message: 'Ticket creado exitosamente',
      ticket: newTicket[0]
    });
  } catch (error) {
    console.error('Error creando ticket:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const updateTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado, asignado_id } = req.body;

    console.log('Actualizando ticket:', id, estado, asignado_id);

    const [result]: any = await pool.execute(
      'UPDATE tickets SET estado = ?, asignado_id = ? WHERE id = ?',
      [estado, asignado_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json({ message: 'Ticket actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando ticket:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [tickets]: any = await pool.execute(`
      SELECT t.*, 
             s.nombre as solicitante_nombre,
             a.nombre as asignado_nombre,
             r_s.nombre as solicitante_rol,
             r_a.nombre as asignado_rol
      FROM tickets t
      LEFT JOIN usuarios s ON t.solicitante_id = s.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      LEFT JOIN roles r_s ON s.rol_id = r_s.id
      LEFT JOIN roles r_a ON a.rol_id = r_a.id
      WHERE t.id = ?
    `, [id]);

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(tickets[0]);
  } catch (error) {
    console.error('Error obteniendo ticket:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};



export const getTicketStats = async (req: Request, res: Response) => {
  try {
    const [stats]: any = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(estado = 'nuevo') as nuevos,
        SUM(estado = 'en_proceso') as en_proceso,
        SUM(estado = 'resuelto') as resueltos,
        SUM(estado = 'cerrado') as cerrados,
        SUM(prioridad = 'alta') as alta_prioridad,
        SUM(prioridad = 'media') as media_prioridad,
        SUM(prioridad = 'baja') as baja_prioridad
      FROM tickets
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener tickets asignados a un técnico específico
export const getTicketsByTecnico = async (req: Request, res: Response) => {
  try {
    const { tecnicoId } = req.params;
    
    const [tickets]: any = await pool.execute(`
      SELECT t.*, 
             s.nombre as solicitante_nombre,
             a.nombre as asignado_nombre
      FROM tickets t
      LEFT JOIN usuarios s ON t.solicitante_id = s.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      WHERE t.asignado_id = ?
      ORDER BY t.creado_en DESC
    `, [tecnicoId]);

    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets por técnico:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener tickets resueltos por un técnico específico
export const getTicketsResueltosByTecnico = async (req: Request, res: Response) => {
  try {
    const { tecnicoId } = req.params;
    
    const [tickets]: any = await pool.execute(`
      SELECT t.*, 
             s.nombre as solicitante_nombre,
             a.nombre as asignado_nombre
      FROM tickets t
      LEFT JOIN usuarios s ON t.solicitante_id = s.id
      LEFT JOIN usuarios a ON t.asignado_id = a.id
      WHERE t.asignado_id = ? AND t.estado = 'resuelto'
      ORDER BY t.creado_en DESC
    `, [tecnicoId]);

    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets resueltos por técnico:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const getTicketsByUsuario = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    console.log('Obteniendo tickets para usuario:', userId);
    
    const [tickets]: any = await pool.execute(`
      SELECT t.*, s.nombre as solicitante_nombre
      FROM tickets t
      LEFT JOIN usuarios s ON t.solicitante_id = s.id
      WHERE t.solicitante_id = ?
      ORDER BY t.creado_en DESC
    `, [userId]);

    console.log('Tickets del usuario:', tickets.length);
    res.json(tickets);
  } catch (error) {
    console.error('Error obteniendo tickets por usuario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};