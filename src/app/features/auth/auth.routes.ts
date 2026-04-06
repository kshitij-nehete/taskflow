import { Routes } from '@angular/router';
import { Login } from './login/login';

export const AUTO_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup').then((m) => m.Signup),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
