import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Navbar } from './shared/navbar/navbar';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'Sistema de Tickets';
  
  constructor(private router: Router, private authService: AuthService) {}

  showNavbar(): boolean {
    // No mostrar navbar en la página de login
    return this.router.url !== '/login' && this.authService.isLoggedIn();
  }
}