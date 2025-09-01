import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  notifications: any[] = [];
  showNotifications: boolean = false;
  unreadCount: number = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    
    if (user && token) {
      this.notificationService.getNotifications(user.id, token).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.unreadCount = notifications.filter((n: any) => !n.leida).length;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  markAsRead(notificationId: number) {
    const token = this.authService.getToken();
    this.notificationService.markAsRead(notificationId, token).subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  getUserRole(): string {
    return this.authService.getUserRole();
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? user.nombre : '';
  }

  logout(): void {
    this.authService.logout();
  }
}