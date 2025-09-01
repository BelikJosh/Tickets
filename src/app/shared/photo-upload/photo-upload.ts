import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoServices } from '../../services/photo.service';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-upload.html',
  styleUrls: ['./photo-upload.css']
})
export class PhotoUploadComponent {
    @Input() currentPhoto: string | undefined;  // <-- Esto permite usar [currentPhoto]
  @Input() currentPhotoUrl: string | null = null;
  @Input() userName: string = '';
  @Input() userId: number = 0;
  @Input() token: string | null = null;
  @Output() photoUploaded = new EventEmitter<string>();

  isUploading = false;
  errorMessage = '';

  constructor(private photoService: PhotoServices) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Por favor, selecciona una imagen válida';
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'La imagen debe ser menor a 2MB';
      return;
    }

    this.uploadPhoto(file);
  }

  async uploadPhoto(file: File): Promise<void> {
    this.isUploading = true;
    this.errorMessage = '';

    try {
      // Convertir a base64
      const { base64, type } = await this.photoService.fileToBase64(file);
      
      if (this.token) {
        // Subir al servidor
        await this.photoService.uploadUserPhoto(
          this.userId, 
          { foto: base64, foto_tipo: type }, 
          this.token
        ).toPromise();
      }

      // Crear URL para previsualización
      const imageUrl = this.photoService.createImageUrl(base64, type);
      this.photoUploaded.emit(imageUrl);
      
    } catch (error) {
      console.error('Error subiendo foto:', error);
      this.errorMessage = 'Error al subir la foto';
    } finally {
      this.isUploading = false;
    }
  }

  getDefaultAvatar(): string {
    return this.photoService.generateDefaultAvatar(this.userName);
  }

  getPhotoUrl(): string {
    if (this.currentPhotoUrl) {
      return this.currentPhotoUrl;
    }
    const svg = this.getDefaultAvatar();
    return `data:image/svg+xml;base64,${this.photoService.svgToBase64(svg)}`;
  }
}