import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'discover',
        loadComponent: () =>
          import('../discover/discover.page').then((m) => m.DiscoverPage),
      },
      {
        path: 'check-in',
        loadComponent: () =>
          import('../check-in/check-in.page').then((m) => m.CheckInPage),
      },
      {
        path: 'bucket-list',
        loadComponent: () =>
          import('../bucket-list/bucket-list.page').then(
            (m) => m.BucketListPage,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
