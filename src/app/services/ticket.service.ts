import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  private getHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Obtener todos los tickets
  getTickets(token: string | null): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error getting tickets:', error);
        return throwError(() => new Error('Error al obtener tickets'));
      })
    );
  }

  // Obtener ticket por ID
  getTicketById(id: number, token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error getting ticket:', error);
        return throwError(() => new Error('Error al obtener ticket'));
      })
    );
  }

  // Obtener tickets del usuario
  getMyTickets(userId: number, token: string | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usuario/${userId}`, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error getting user tickets:', error);
        return throwError(() => new Error('Error al obtener tickets del usuario'));
      })
    );
  }

  // Crear nuevo ticket
  createTicket(ticket: any, token: string | null): Observable<any> {
    return this.http.post<any>(this.apiUrl, ticket, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error creating ticket:', error);
        return throwError(() => new Error('Error al crear ticket'));
      })
    );
  }

  // Actualizar ticket
  updateTicket(id: number, ticket: any, token: string | null): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, ticket, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error updating ticket:', error);
        return throwError(() => new Error('Error al actualizar ticket'));
      })
    );
  }
// Obtener tickets de un técnico específico
getTicketsByTecnico(tecnicoId: number, token: string | null): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/tecnico/${tecnicoId}`, { 
    headers: this.getHeaders(token) 
  }).pipe(
    catchError(error => {
      console.error('Error getting technician tickets:', error);
      return throwError(() => new Error('Error al obtener tickets del técnico'));
    })
  );
}

// Obtener tickets resueltos por un técnico específico
getTicketsResueltosByTecnico(tecnicoId: number, token: string | null): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/tecnico/${tecnicoId}/resueltos`, { 
    headers: this.getHeaders(token) 
  }).pipe(
    catchError(error => {
      console.error('Error getting resolved tickets:', error);
      return throwError(() => new Error('Error al obtener tickets resueltos'));
    })
  );
}
  // Obtener estadísticas
  getEstadisticas(token: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`, { 
      headers: this.getHeaders(token) 
    }).pipe(
      catchError(error => {
        console.error('Error getting stats:', error);
        return throwError(() => new Error('Error al obtener estadísticas'));
      })
    );
  }
}