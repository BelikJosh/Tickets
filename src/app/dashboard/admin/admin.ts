import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { PhotoUploadComponent } from '../../shared/photo-upload/photo-upload'; // Ajusta ruta

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, PhotoUploadComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {

  currentAdmin: any;
  cantidadEmpleados: number = 0;
  cantidadIT: number = 0;
  reportesGenerados: any[] = [];
  currentTab: string = 'empleados';
  
  constructor(
    public authService: AuthService,
    private apiService: ApiService
  ) {}
filteredUsers: any[] = [];
usuarios: any[] = []; // todos los usuarios cargados

filterTab(tab: string) {
  this.currentTab = tab;

  switch(tab) {
    case 'empleados':
      // Solo empleados normales, sin IT ni admin
      this.filteredUsers = this.usuarios.filter(u => u.rol_nombre === 'empleado');
      break;
    case 'it':
      this.filteredUsers = this.usuarios.filter(u => u.rol_nombre === 'it');
      break;
    case 'admin':
      this.filteredUsers = this.usuarios.filter(u => u.rol_nombre === 'admin');
      break;
    case 'todos':
      this.filteredUsers = this.usuarios; // todos los usuarios
      break;
  }
}

get cantidadAdmin(): number {
  return this.usuarios.filter(u => u.rol_nombre === 'admin').length;
}
get cantidadTotal(): number {
  return this.usuarios.length;
}

// Editar usuario
editarUsuario(user: any) {
  const nuevoNombre = prompt('Editar nombre:', user.nombre);
  const nuevoEmail = prompt('Editar email:', user.email);

  if(nuevoNombre && nuevoEmail) {
    const token = this.authService.getToken();
    this.apiService.updateUser(user.id, { nombre: nuevoNombre, email: nuevoEmail }, token).subscribe({
      next: () => {
        alert('✅ Usuario actualizado');
        this.cargarUsuarios();
      },
      error: () => alert('❌ Error al actualizar usuario')
    });
  }
}

// Eliminar usuario
eliminarUsuario(user: any) {
  if(confirm(`¿Seguro que deseas eliminar a ${user.nombre}?`)) {
    const token = this.authService.getToken();
    this.apiService.deleteUser(user.id, token).subscribe({
      next: () => {
        alert('✅ Usuario eliminado');
        this.cargarUsuarios();
      },
      error: () => alert('❌ Error al eliminar usuario')
    });
  }
}

// Cargar usuarios desde API
cargarUsuarios() {
  const token = this.authService.getToken();
  this.apiService.getUsers(token).subscribe({
    next: (users: any[]) => {
      this.usuarios = users;
      this.filterTab(this.currentTab); // aplicar filtro
      this.cantidadEmpleados = this.usuarios.filter(u => u.rol_nombre !== 'it').length;
      this.cantidadIT = this.usuarios.filter(u => u.rol_nombre === 'it').length;
    }
  });
}

  ngOnInit() {
    this.currentAdmin = this.authService.getCurrentUser();
    this.loadUsuarios();
    this.loadReportes();
    this.cargarUsuarios();
  }

  onPhotoUploaded(newPhotoUrl: string) {
    if (this.currentAdmin) {
      this.currentAdmin.fotoUrl = newPhotoUrl;
    }
  }

  loadUsuarios() {
    const token = this.authService.getToken();
    if (!token) return;

    this.apiService.getUsers(token).subscribe({
      next: (users: any[]) => {
        this.cantidadEmpleados = users.filter(u => u.rol_nombre === 'empleado').length;
        this.cantidadIT = users.filter(u => u.rol_nombre === 'it').length;
      },
      error: (err: any) => {
        console.error('Error cargando usuarios', err);
        this.cantidadEmpleados = 5; // Simulado
        this.cantidadIT = 3; // Simulado
      }
    });
  }

  loadReportes() {
    const token = this.authService.getToken();
    if (!token) return;

    this.apiService.getReportes(token).subscribe({
      next: (reportes: any[]) => {
        this.reportesGenerados = reportes;
      },
      error: (err: any) => {
        console.error('Error cargando reportes', err);
        this.reportesGenerados = this.getSampleReportes();
      }
    });
  }



  generarReporte() {
    const reporte = {
      id: this.reportesGenerados.length + 1,
      fecha: new Date(),
      generadoPor: this.currentAdmin.nombre,
      tipo: 'Resumen General'
    };
    this.reportesGenerados.push(reporte);
    alert('📊 Reporte generado exitosamente');
  }

  verHistorialReportes() {
    this.currentTab = 'reportes';
  }

  verReporte(reporteId: number) {
    alert(`Viendo detalles del reporte #${reporteId}`);
  }

  descargarReporte(reporteId: number) {
    alert(`Descargando reporte #${reporteId}`);
  }

  private getSampleReportes() {
    return [
      { id: 1, fecha: new Date(), generadoPor: 'Admin', tipo: 'Resumen General' },
      { id: 2, fecha: new Date(), generadoPor: 'Admin', tipo: 'Actividad IT' }
    ];
  }
}
