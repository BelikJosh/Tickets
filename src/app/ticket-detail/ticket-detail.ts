import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../services/ticket.service';
import { CommentService } from '../services/comment.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.css']
})
export class TicketDetail implements OnInit {
  ticket: any = null;
  comments: any[] = [];
  newComment: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private commentService: CommentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const ticketId = this.route.snapshot.params['id'];
    this.loadTicketDetails(ticketId);
    this.loadComments(ticketId);
  }

  loadTicketDetails(ticketId: number) {
    const token = this.authService.getToken();
    
    if (!token) {
      alert('❌ No hay token de autenticación');
      this.isLoading = false;
      return;
    }

    this.ticketService.getTicketById(ticketId, token).subscribe({
      next: (ticket: any) => {
        this.ticket = ticket;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading ticket:', error);
        this.isLoading = false;
      }
    });
  }

  loadComments(ticketId: number) {
    const token = this.authService.getToken();
    
    if (!token) {
      console.error('No token available for comments');
      return;
    }

    this.commentService.getCommentsByTicket(ticketId, token).subscribe({
      next: (comments: any) => {
        this.comments = comments;
      },
      error: (error: any) => {
        console.error('Error loading comments:', error);
      }
    });
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const user = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    const ticketId = this.route.snapshot.params['id'];

    if (!token) {
      alert('❌ No hay token de autenticación');
      return;
    }

    this.commentService.createComment(ticketId, {
      usuario_id: user.id,
      comentario: this.newComment
    }, token).subscribe({
      next: () => {
        this.newComment = '';
        this.loadComments(ticketId);
      },
      error: (error: any) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  getStatusClass(estado: string): string {
    switch(estado?.toLowerCase()) {
      case 'nuevo': return 'new';
      case 'en_proceso': return 'process';
      case 'resuelto': return 'resolved';
      default: return '';
    }
  }

  getPriorityClass(prioridad: string): string {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'high';
      case 'media': return 'medium';
      case 'baja': return 'low';
      default: return '';
    }
  }
}