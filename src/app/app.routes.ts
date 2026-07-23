import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'discover',
    loadComponent: () => import('./discover/discover.page').then( m => m.DiscoverPage)
  },
  {
    path: 'check-in',
    loadComponent: () => import('./check-in/check-in.page').then( m => m.CheckInPage)
  },
  {
    path: 'bucket-list',
    loadComponent: () => import('./bucket-list/bucket-list.page').then( m => m.BucketListPage)
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.page').then( m => m.ProfilePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.page').then( m => m.RegisterPage)
  },
];
