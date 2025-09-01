import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PhotoServices {
  private apiUrl = `${environment.apiUrl}/users`;

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

  // Subir foto de perfil
  uploadUserPhoto(userId: number, photoData: { foto: string; foto_tipo: string }, token: string | null): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/photo`, photoData, { 
      headers: this.getHeaders(token) 
    });
  }

  // Actualizar la foto (alias de uploadUserPhoto, pero más claro)
updateUserPhoto(userId: number, photoData: { foto: string; foto_tipo: string }, token: string | null): Observable<any> {
  return this.http.put(`${this.apiUrl}/${userId}/photo`, photoData, { 
    headers: this.getHeaders(token) 
  });
}


  // Obtener foto de perfil
  getUserPhoto(userId: number, token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/photo`, { 
      headers: this.getHeaders(token) 
    });
  }

  // Obtener usuario con información de foto
  getUserWithPhoto(userId: number, token: string | null): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, { 
      headers: this.getHeaders(token) 
    });
  }

  // Convertir archivo a base64
  async fileToBase64(file: File): Promise<{ base64: string; type: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve({ base64, type: file.type });
      };
      reader.onerror = error => reject(error);
    });
  }

  // Crear URL para mostrar la imagen
  createImageUrl(base64: string, type: string): string {
  if (!base64 || !type) return ''; // evita URL inválida
  return `data:${type};base64,${base64}`;
}


  // Generar avatar por defecto basado en el nombre
  generateDefaultAvatar(name: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9A826', 
      '#6C5CE7', '#FD79A8', '#00B894', '#FDCB6E'
    ];
    
    const initial = name.charAt(0).toUpperCase();
    const color = colors[name.length % colors.length];
    
    return `
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" fill="${color}" rx="40"/>
        <text x="40" y="45" text-anchor="middle" fill="white" font-size="32" font-weight="600" font-family="Arial, sans-serif">
          ${initial}
        </text>
      </svg>
    `;
  }

  // Convertir SVG a base64
  svgToBase64(svg: string): string {
    return btoa(unescape(encodeURIComponent(svg)));
  }
}