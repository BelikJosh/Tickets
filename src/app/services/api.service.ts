import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para obtener headers con token (sin depender de AuthService)
  getHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
// Dentro de ApiService
getUserPhoto(userId: number, token: string | null): Observable<any> {
  return this.http.get(`${this.apiUrl}/users/${userId}/photo`, { headers: this.getHeaders(token) });
}

  // User methods - aceptar string | null
  getUsers(token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders(token) });
  }

  getUserProfile(token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/profile`, { headers: this.getHeaders(token) });
  }


  // Auth methods
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, user);
  }

  // Ticket methods
  getTickets(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tickets`, { headers: this.getHeaders(token) });
  }

  createTicket(ticket: any, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets`, ticket, { headers: this.getHeaders(token) });
  }

  updateTicket(id: number, ticket: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/tickets/${id}`, ticket, { headers: this.getHeaders(token) });
  }
// Dentro de ApiService
getReportes(token: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/reportes`, { headers: this.getHeaders(token) });
}

updateUser(userId: number, data: any, token: string | null) {
  return this.http.put(`${this.apiUrl}/users/${userId}`, data, { headers: this.getHeaders(token) });
}

deleteUser(userId: number, token: string | null) {
  return this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders(token) });
}




  // Health check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}