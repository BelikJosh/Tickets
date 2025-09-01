import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { PhotoUploadComponent } from '../../shared/photo-upload/photo-upload'; // Ajusta la ruta según tu proyecto


@Component({
  selector: 'app-it',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoUploadComponent],
  templateUrl: './it.html',
  styleUrls: ['./it.css']
})
export class It implements OnInit {
  // Tickets para diferentes vistas
  todosTickets: any[] = [];
  misTicketsEnProceso: any[] = [];
  misTicketsResueltos: any[] = [];
  
  // Tickets mostrados actualmente
  displayedTickets: any[] = [];
  
  isLoading: boolean = false;
  currentTab: string = 'todos';
  estadisticas: any = {};
  usuariosIT: any[] = [];
  selectedTechnician: number | null = null;
  showAssignmentModal: boolean = false;
  currentTicketForAssignment: number | null = null;

  // Usuario actual
  currentUser: any;

  constructor(
    private ticketService: TicketService,
    public authService: AuthService,
    private apiService: ApiService
  ) {}

onPhotoUploaded(newPhotoUrl: string) {
    if (this.currentUser) {
      this.currentUser.fotoUrl = newPhotoUrl;
    }
  }

  
 ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    // Cargar foto desde API si existe
    const token = this.authService.getToken();
    if (token && this.currentUser?.id) {
      this.apiService.getUserPhoto(this.currentUser.id, token).subscribe({
        next: (res: any) => {
          this.currentUser.fotoUrl = `data:${res.foto_tipo};base64,${res.foto}`;
        },
        error: (err: any) => {
          console.warn('No se pudo cargar la foto del usuario IT', err);
        }
      });
    }

    this.loadTodosTickets();
    this.loadMisTickets();
    this.loadUsuariosIT();
  }


  // Cargar todos los tickets (vista general)
  loadTodosTickets() {
    this.isLoading = true;
    const token = this.authService.getToken();
    
    if (!token) {
      alert('❌ No hay token de autenticación');
      this.isLoading = false;
      return;
    }

    this.ticketService.getTickets(token).subscribe({
      next: (tickets: any[]) => {
        this.todosTickets = tickets || [];
        this.updateDisplayedTickets();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading all tickets:', error);
        this.todosTickets = this.getSampleTickets();
        this.updateDisplayedTickets();
        this.isLoading = false;
      }
    });
  }

  // Cargar tickets del usuario actual
  loadMisTickets() {
    const token = this.authService.getToken();
    
    if (!token || !this.currentUser) {
      return;
    }

    // Tickets en proceso del usuario actual
    this.ticketService.getTicketsByTecnico(this.currentUser.id, token).subscribe({
      next: (tickets: any[]) => {
        this.misTicketsEnProceso = tickets.filter(t => t.estado === 'en_proceso');
      },
      error: (error: any) => {
        console.error('Error loading my tickets:', error);
        this.misTicketsEnProceso = this.todosTickets.filter(t => 
          t.asignado_id === this.currentUser.id && t.estado === 'en_proceso'
        );
      }
    });

    // Tickets resueltos del usuario actual
    this.ticketService.getTicketsResueltosByTecnico(this.currentUser.id, token).subscribe({
      next: (tickets: any[]) => {
        this.misTicketsResueltos = tickets;
      },
      error: (error: any) => {
        console.error('Error loading my resolved tickets:', error);
        this.misTicketsResueltos = this.todosTickets.filter(t => 
          t.asignado_id === this.currentUser.id && t.estado === 'resuelto'
        );
      }
    });
  }

  loadUsuariosIT() {
    const token = this.authService.getToken();
    
    if (!token) return;

    this.apiService.getUsers(token).subscribe({
      next: (users: any[]) => {
        this.usuariosIT = users.filter(user => 
          user.rol_nombre === 'it' || user.rol_id === 2
        );
      },
      error: (error: any) => {
        console.error('Error loading IT users:', error);
        this.usuariosIT = this.getSampleITUsers();
      }
    });
  }

  // Actualizar tickets mostrados según la pestaña seleccionada
  updateDisplayedTickets() {
    switch(this.currentTab) {
      case 'todos':
        this.displayedTickets = this.todosTickets;
        break;
      case 'pendientes':
        this.displayedTickets = this.todosTickets.filter(t => t.estado === 'nuevo');
        break;
      case 'proceso':
        this.displayedTickets = this.misTicketsEnProceso;
        break;
      case 'resueltos':
        this.displayedTickets = this.misTicketsResueltos;
        break;
      default:
        this.displayedTickets = this.todosTickets;
    }
  }

  filterTickets(filter: string) {
    this.currentTab = filter;
    this.updateDisplayedTickets();
  }

  // Métodos de asignación y resolución (se mantienen igual)
  openAssignmentModal(ticketId: number) {
    this.currentTicketForAssignment = ticketId;
    this.selectedTechnician = null;
    this.showAssignmentModal = true;
  }

  closeAssignmentModal() {
    this.showAssignmentModal = false;
    this.currentTicketForAssignment = null;
    this.selectedTechnician = null;
  }

  assignTicketToTechnician() {
    if (!this.currentTicketForAssignment || !this.selectedTechnician) {
      alert('❌ Debes seleccionar un técnico');
      return;
    }

    const token = this.authService.getToken();
    if (!token) return;

    this.ticketService.updateTicket(this.currentTicketForAssignment, {
      estado: 'en_proceso',
      asignado_id: this.selectedTechnician
    }, token).subscribe({
      next: () => {
        alert('✅ Ticket asignado correctamente');
        this.closeAssignmentModal();
        this.loadTodosTickets();
        this.loadMisTickets();
      },
      error: (error: any) => {
        console.error('Error assigning ticket:', error);
        alert('✅ Ticket asignado correctamente (simulado)');
        this.closeAssignmentModal();
        this.loadTodosTickets();
        this.loadMisTickets();
      }
    });
  }

  takeTicket(ticketId: number) {
    const token = this.authService.getToken();
    if (!token) return;

    this.ticketService.updateTicket(ticketId, {
      estado: 'en_proceso',
      asignado_id: this.currentUser.id
    }, token).subscribe({
      next: () => {
        alert('✅ Ticket asignado a ti');
        this.loadTodosTickets();
        this.loadMisTickets();
      },
      error: (error: any) => {
        console.error('Error taking ticket:', error);
        alert('✅ Ticket asignado a ti (simulado)');
        this.loadTodosTickets();
        this.loadMisTickets();
      }
    });
  }

  resolveTicket(ticketId: number) {
    const token = this.authService.getToken();
    if (!token) return;

    this.ticketService.updateTicket(ticketId, {
      estado: 'resuelto',
      asignado_id: this.currentUser.id
    }, token).subscribe({
      next: () => {
        alert('✅ Ticket marcado como resuelto');
        this.loadTodosTickets();
        this.loadMisTickets();
      },
      error: (error: any) => {
        console.error('Error resolving ticket:', error);
        alert('✅ Ticket resuelto (simulado)');
        this.loadTodosTickets();
        this.loadMisTickets();
      }
    });
  }

  // Métodos de utilidad
  getStatusClass(estado: string): string {
    switch(estado?.toLowerCase()) {
      case 'nuevo': return 'new';
      case 'en_proceso': return 'process';
      case 'resuelto': return 'resolved';
      case 'cerrado': return 'closed';
      default: return '';
    }
  }

  getPriorityClass(prioridad: string): string {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'high';
      case 'media': return 'medium';
      case 'baja': return 'low';
      default: return '';
    }
  }

  getTechnicianName(technicianId: number): string {
    const technician = this.usuariosIT.find(u => u.id === technicianId);
    return technician ? technician.nombre : 'Sin asignar';
  }

  isMyTicket(ticket: any): boolean {
    return ticket.asignado_id === this.currentUser.id;
  }

  // Estadísticas personales
  getMyStats() {
    return {
      total: this.todosTickets.length,
      pendientes: this.todosTickets.filter(t => t.estado === 'nuevo').length,
      enProceso: this.misTicketsEnProceso.length,
      resueltos: this.misTicketsResueltos.length
    };
  }

  // Datos de ejemplo
  private getSampleTickets() {
    return [
      {
        id: 1,
        titulo: 'Problema con internet',
        descripcion: 'Internet muy lento',
        estado: 'nuevo',
        prioridad: 'alta',
        solicitante_nombre: 'Juan Pérez',
        asignado_id: null
      },
      {
        id: 2,
        titulo: 'Software necesario',
        descripcion: 'Necesito Photoshop',
        estado: 'en_proceso',
        prioridad: 'media',
        solicitante_nombre: 'María García',
        asignado_id: this.currentUser.id  // Asignado al usuario actual
      }
    ];
  }

  private getSampleITUsers() {
    return [
      { id: 2, nombre: 'María IT', email: 'maria.it@empresa.com', rol_nombre: 'it' },
      { id: 4, nombre: 'Pedro Soporte', email: 'pedro.soporte@empresa.com', rol_nombre: 'it' }
    ];
  }

  verDetalles(ticketId: number) {
    alert(`Viendo detalles del ticket #${ticketId}`);
  }

  generarReporte() {
    const stats = this.getMyStats();
    const reporte = {
      fecha: new Date().toLocaleDateString(),
      ...stats
    };
    
    alert(`📊 Mi Reporte:\n\n` +
          `Fecha: ${reporte.fecha}\n` +
          `Total Tickets: ${reporte.total}\n` +
          `Pendientes: ${reporte.pendientes}\n` +
          `Mis En Proceso: ${reporte.enProceso}\n` +
          `Mis Resueltos: ${reporte.resueltos}`);
  }

  verMisTickets() {
    const stats = this.getMyStats();
    alert(`👤 Mis Tickets:\n\n` +
          `En proceso: ${stats.enProceso}\n` +
          `Resueltos: ${stats.resueltos}\n` +
          `Total: ${stats.enProceso + stats.resueltos}`);
  }

  assistantActive: boolean = true;

  // Método para alternar la visibilidad del asistente
toggleAssistant() {
  this.assistantActive = !this.assistantActive;
}

// Método para manejar las acciones del asistente
assistantAction(action: string) {
  switch(action) {
    case 'stats':
      this.verMisTickets();
      break;
    case 'priority':
      this.filterTickets('pendientes');
      // También puedes enfocar en tickets de alta prioridad
      break;
    case 'help':
      // Aquí puedes implementar un modal de ayuda
      alert('Sistema de ayuda en desarrollo. Pronto tendrás acceso a guías detalladas.');
      break;
  }

}
}