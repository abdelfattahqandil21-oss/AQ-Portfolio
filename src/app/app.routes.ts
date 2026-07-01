import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/layouts/shell/shell').then(m => m.Shell),
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then(m => m.Home),
      },
    ],
  },
];
