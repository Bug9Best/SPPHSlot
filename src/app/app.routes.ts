import { Routes } from '@angular/router';
import { JoinGame } from '../page/join-game/join-game';
import { GameRoom } from '../page/game-room/game-room';
import { Register } from '../page/register/register';
import { Console } from '../page/console/console';
import { Room } from '../page/room/room';
import { Home } from '../page/home/home';
import { Dashboard } from '../page/dashboard/dashboard';

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
        component: Console
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
