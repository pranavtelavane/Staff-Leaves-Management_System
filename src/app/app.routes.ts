import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { hodGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((r) => r.AUTH_ROUTES),
  },
  //   {
  //     path: '',
  //     redirectTo: 'auth/login',
  //     pathMatch: 'full',
  //   },
  //   {
  //     path: '**',
  //     redirectTo: 'auth/login',
  //   },

  {
    path: '',
    loadComponent: () => import('./layout/layout').then((c) => c.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'staff-management',
        loadComponent: () =>
          import('./staff-management/staff-management').then((c) => c.StaffManagement),
        canActivate: [hodGuard],
      },
      {
        path: 'leave-management',
        loadComponent: () =>
          import('./leave-management/leave-management').then((c) => c.LeaveManagement),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
