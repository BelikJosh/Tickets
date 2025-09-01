import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { PhotoServices } from '../../services/photo.service';
import { PhotoUploadComponent } from '../../shared/photo-upload/photo-upload';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoUploadComponent],
  templateUrl: './empleado.html',
  styleUrls: ['./empleado.css']
})
export class Empleado implements OnInit {
  currentUser: any;   userAvatarUrl: string = ''; // Añade esta propiedad
  tickets: any[] = [];
  filteredTickets: any[] = [];
  isLoading: boolean = false;
  showCreateForm: boolean = false;
  currentFilter: string = 'todos';
  currentView: string = 'mis-tickets'; // AÑADIR ESTA PROPIEDAD

  newTicket: any = {
    titulo: '',
    descripcion: '',
    prioridad: 'media'
  };

  constructor(
    private router: Router,
    private ticketService: TicketService,
    public authService: AuthService,
    private photoService: PhotoServices,
  ) {}
ngOnInit() {
  this.currentUser = this.authService.getCurrentUser();
  this.loadTickets();  
  this.loadUserPhoto(); // <-- llamamos a la foto aquí


  const token = this.authService.getToken();
  if (token && this.currentUser?.id) {
    this.loadUserPhoto(); // <-- aquí
    this.photoService.getUserPhoto(this.currentUser.id, token).subscribe({
      next: (res: any) => {
        if (res && res.foto) {
          this.currentUser.fotoUrl = `data:${res.foto_tipo};base64,${res.foto}`;
        }
      },
      error: (err) => console.warn('No se pudo cargar la foto del usuario', err)
    });
  }
}

  
  refreshTickets() {
    this.isLoading = true;
    this.loadTickets();
    
    // Mostrar feedback visual de actualización
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
 setView(view: string) {
    this.currentView = view;
    
    // Si cambiamos a una vista diferente de nuevo-ticket, ocultar el formulario
    if (view !== 'nuevo-ticket') {
      this.showCreateForm = false;
    }
    
    // Si vamos a la vista de tickets, recargarlos
    if (view === 'mis-tickets') {
      this.loadTickets();
    }
  }
  loadTickets() {
    this.isLoading = true;
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    if (!token) {
      alert('❌ No hay token de autenticación. Por favor, inicia sesión again.');
      this.isLoading = false;
      return;
    }

    this.ticketService.getMyTickets(user.id, token).subscribe({
      next: (tickets) => {
        console.log('Tickets recibidos:', tickets);
        this.tickets = tickets || [];
        this.applyFilter(this.currentFilter);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.tickets = this.getSampleTickets();
        this.applyFilter(this.currentFilter);
        this.isLoading = false;
      }
    });
  }

  applyFilter(filter: string) {
    this.currentFilter = filter;
    switch (filter) {
      case 'todos':
        this.filteredTickets = this.tickets;
        break;
      case 'pendientes':
        this.filteredTickets = this.tickets.filter(t => 
          t.estado === 'nuevo' || t.estado === 'pendiente');
        break;
      case 'proceso':
        this.filteredTickets = this.tickets.filter(t => t.estado === 'en_proceso');
        break;
      case 'resueltos':
        this.filteredTickets = this.tickets.filter(t => 
          t.estado === 'resuelto' || t.estado === 'cerrado');
        break;
      default:
        this.filteredTickets = this.tickets;
    }
  }

  getPendingTickets(): number {
    return this.tickets.filter(t => 
      t.estado === 'nuevo' || t.estado === 'pendiente').length;
  }

  getInProgressTickets(): number {
    return this.tickets.filter(t => t.estado === 'en_proceso').length;
  }

  getResolvedTickets(): number {
    return this.tickets.filter(t => 
      t.estado === 'resuelto' || t.estado === 'cerrado').length;
  }

  createNewTicket() {
    this.showCreateForm = true;
  }

  onSubmitTicket() {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    if (!token) {
      alert('❌ No hay token de autenticación. Por favor, inicia sesión again.');
      return;
    }

    const ticketData = {
      ...this.newTicket,
      solicitante_id: user.id
    };

    console.log('Enviando ticket:', ticketData);

    this.ticketService.createTicket(ticketData, token).subscribe({
      next: (response: any) => {
        console.log('Ticket creado:', response);
        alert('✅ Ticket creado exitosamente!');
        this.showCreateForm = false;
        this.newTicket = { titulo: '', descripcion: '', prioridad: 'media' };
        
        if (response.ticket) {
          this.tickets.unshift(response.ticket);
          this.applyFilter(this.currentFilter);
        } else {
          this.loadTickets();
        }
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        alert('❌ Error al crear ticket. Verifica la consola para más detalles.');
      }
    });
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.newTicket = { titulo: '', descripcion: '', prioridad: 'media' };
  }

  viewTicketDetails(ticketId: number) {
    console.log('Viendo ticket:', ticketId);
    alert(`📋 Detalles del Ticket #${ticketId}\n\nEsta funcionalidad estará disponible pronto.`);
  }

  getStatusClass(estado: string): string {
    if (!estado) return '';
    
    switch(estado.toLowerCase()) {
      case 'nuevo': 
      case 'pendiente': 
        return 'nuevo';
      case 'en_proceso': 
        return 'en_proceso';
      case 'resuelto': 
        return 'resuelto';
      case 'cerrado': 
        return 'cerrado';
      default: 
        return '';
    }
  }

  getPriorityClass(prioridad: string): string {
    if (!prioridad) return '';
    
    switch(prioridad.toLowerCase()) {
      case 'alta': 
        return 'alta';
      case 'media': 
        return 'media';
      case 'baja': 
        return 'baja';
      case 'critica': 
        return 'critica';
      default: 
        return '';
    }
  }

  exportTickets() {
    // Lógica para exportar tickets
    console.log('Exporting tickets...');
    alert('📊 Función de exportación estará disponible pronto.');
  }
  
 async loadUserPhoto() {
  const user = this.currentUser;
  const token = this.authService.getToken();

  if (!user?.id || !token) return;

  try {
    const photoData: any = await firstValueFrom(this.photoService.getUserPhoto(user.id, token));

    if (photoData?.foto) {
      user.fotoUrl = this.photoService.createImageUrl(photoData.foto, photoData.foto_tipo);
    } else {
      // Avatar por defecto si no hay foto
      const svg = this.photoService.generateDefaultAvatar(user.nombre);
      user.fotoUrl = `data:image/svg+xml;base64,${this.photoService.svgToBase64(svg)}`;
    }
  } catch (error) {
    console.error('Error cargando la foto del usuario:', error);
    const svg = this.photoService.generateDefaultAvatar(user.nombre);
    user.fotoUrl = `data:image/svg+xml;base64,${this.photoService.svgToBase64(svg)}`;
  }
}

currentPhotoUrl: string | null = null;

onPhotoUploaded(newPhotoBase64: string) {
  if (!this.currentUser?.id) return;

  const token = this.authService.getToken();
  if (!token) return;

  // Quitar prefijo si viene completo
  const base64 = newPhotoBase64.includes('base64,')
    ? newPhotoBase64.split('base64,')[1]
    : newPhotoBase64;

  this.currentUser.fotoUrl = this.photoService.createImageUrl(base64, 'image/png');

  this.photoService.uploadUserPhoto(
    this.currentUser.id,
    { foto: base64, foto_tipo: 'image/png' },
    token
  ).subscribe({
    next: () => console.log('Foto actualizada en backend'),
    error: (err) => console.error('Error guardando foto en backend', err)
  });
}







  getSampleTickets() {
    return [
      {
        id: 1,
        titulo: 'Problema con impresora',
        descripcion: 'La impresora no responde en el tercer piso...',
        estado: 'nuevo',
        prioridad: 'media',
        creado_en: new Date().toISOString(),
        solicitante_nombre: 'Usuario Demo'
      },
      {
        id: 2,
        titulo: 'Software no funciona',
        descripcion: 'La aplicación de contabilidad se cierra inesperadamente...',
        estado: 'en_proceso',
        prioridad: 'alta',
        creado_en: new Date(Date.now() - 86400000).toISOString(), // Hace 1 día
        solicitante_nombre: 'Usuario Demo'
      },
      {
        id: 3,
        titulo: 'Acceso a carpeta compartida',
        descripcion: 'Necesito acceso a la carpeta de proyectos 2024...',
        estado: 'resuelto',
        prioridad: 'baja',
        creado_en: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
        solicitante_nombre: 'Usuario Demo'
      }
    ];
  }

}