import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/features/dashboard/dashboard').then(m => m.DashboardComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
