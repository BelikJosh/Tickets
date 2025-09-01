import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private apiService: ApiService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    try {
      const user = localStorage.getItem('currentUser');
      if (user) {
        this.currentUserSubject.next(JSON.parse(user));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.login(email, password).subscribe({
        next: (response: any) => {
          if (response.token && response.user && this.isBrowser) {
            try {
              localStorage.setItem('token', response.token);
              localStorage.setItem('currentUser', JSON.stringify(response.user));
              this.currentUserSubject.next(response.user);
              resolve(true);
            } catch (error) {
              console.error('Error saving to localStorage:', error);
              resolve(false);
            }
          } else {
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          resolve(false);
        }
      });
    });
  }

  
  logout(): void {
    if (this.isBrowser) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    try {
      return !!localStorage.getItem('token');
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return false;
    }
  }

  getUserRole(): string {
    const user = this.currentUserSubject.value;
    return user ? user.rol_nombre : '';
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage');
        this.logout(); // Cerrar sesión si no hay token
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  }

  
   // Verificar si el token es válido
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Aquí podrías agregar validación JWT si quieres
    return true;
  }


}