import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getHeaders(token: string | null): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  getNotifications(userId: number, token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`, { 
      headers: this.getHeaders(token) 
    });
  }

  markAsRead(notificationId: number, token: string | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/${notificationId}/read`, {}, { 
      headers: this.getHeaders(token) 
    });
  }
}