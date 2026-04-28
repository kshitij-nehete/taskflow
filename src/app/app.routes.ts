import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/landing').then(m => m.Landing),
        pathMatch: 'full'
    },
    {
        path:'auth',
        canActivate: [guestGuard],
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTO_ROUTES)
    },
    {
        path:'dashboard',
        canActivate: [authGuard],
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
    },
    {
        path:'projects',
        canActivate: [authGuard],
        loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
    },
        {
        path:'tasks',
        canActivate: [authGuard],
        loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES)
    },
];
