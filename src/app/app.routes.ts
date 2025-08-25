import { Routes } from '@angular/router';
import { Register } from '../page/register/register';
import { Console } from '../page/console/console';
import { Room } from '../page/room/room';
import { Home } from '../page/home/home';
import { Dashboard } from '../page/dashboard/dashboard';
import { Detail } from '../page/detail/detail';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: Home
    },
    {
        path: 'register',
        component: Register
    },
    {
        path: 'detail/:uid',
        component: Detail
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'console',
        component: Console
    },
    {
        path: 'room/:id',
        component: Room
    },
];
