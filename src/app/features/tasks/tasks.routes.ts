import { Routes } from '@angular/router';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./task-board/task-board').then((m) => m.TaskBoard),
  },
];
