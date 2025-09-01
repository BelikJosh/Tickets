import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).then(success => {
      this.isLoading = false;
      
      if (success) {
        const user = this.authService.getCurrentUser();
        
        // Redirigir según el rol
        switch(user.rol_nombre) {
          case 'admin':
            this.router.navigate(['/admin']);
            break;
          case 'it':
            this.router.navigate(['/it']);
            break;
          case 'empleado':
            this.router.navigate(['/empleado']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      } else {
        this.errorMessage = 'Credenciales incorrectas. Use: juan@empresa.com / 123456';
      }
    });
  }
}