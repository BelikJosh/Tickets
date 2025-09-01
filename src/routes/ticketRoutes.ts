import express from 'express';
import { 
  getTickets, 
  createTicket, 
  updateTicket, 
  getTicketStats,
  getTicketsByUsuario,
  getTicketById, getTicketsByTecnico,
  getTicketsResueltosByTecnico
} from '../controllers/ticketController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getTickets);
router.get('/:id', authenticateToken, getTicketById);
router.post('/', authenticateToken, createTicket);
router.put('/:id', authenticateToken, updateTicket);
router.get('/estadisticas', authenticateToken, getTicketStats);
router.get('/estadisticas', authenticateToken, getTicketStats);  // ← Esta línea debe existir
router.get('/usuario/:userId', authenticateToken, getTicketsByUsuario);
router.get('/tecnico/:tecnicoId', authenticateToken, getTicketsByTecnico);
router.get('/tecnico/:tecnicoId/resueltos', authenticateToken, getTicketsResueltosByTecnico);
export default router;