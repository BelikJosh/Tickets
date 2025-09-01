import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getCommentsByTicket(ticketId: number, token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/ticket/${ticketId}`, { 
      headers: this.getHeaders(token) 
    });
  }

  createComment(ticketId: number, comment: any, token: string | null): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket/${ticketId}`, comment, { 
      headers: this.getHeaders(token) 
    });
  }
}