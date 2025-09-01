import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { TicketDetail } from './ticket-detail/ticket-detail';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./dashboard/admin/admin').then(m => m.Admin),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'admin' } 
  },
  { 
    path: 'empleado', 
    loadComponent: () => import('./dashboard/empleado/empleado').then(m => m.Empleado),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'empleado' } 
  },
  { 
    path: 'it', 
    loadComponent: () => import('./dashboard/it/it').then(m => m.It),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'it' } 
  },
   {
    path: 'ticket/:id',
    component: TicketDetail,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];