import { Routes } from '@angular/router';
import { Register } from '../page/register/register';
import { Console } from '../page/console/console';
import { Room } from '../page/room/room';
import { Home } from '../page/home/home';
import { Detail } from '../page/detail/detail';
import { Join } from '../page/join/join';
import { Winner } from '../page/winner/winner';
import { Opening } from '../page/opening/opening';
import { OpeningAction } from '../page/opening-action/opening-action';
import { OpeningPopEnergy } from '../page/opening-pop-energy/opening-pop-energy';
import { OpeningCeremony } from '../page/opening-ceremony/opening-ceremony';
import { OpeningGrand } from '../page/opening-grand/opening-grand';

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
        path: 'console',
        component: Console
    },
    {
        path: 'room/:id',
        component: Room
    },
    {
        path: 'join',
        component: Join
    },
    {
        path: 'winner',
        component: Winner
    },
    {
        path: 'opening',
        component: Opening
    },
    {
        path: 'opening-action',
        component: OpeningAction
    },
    {
        path: 'opening-ceremony',
        component: OpeningCeremony
    },
    {
        path: 'opening-pop-energy',
        component: OpeningPopEnergy
    },
    {
        path: 'opening-grand',
        component: OpeningGrand
    }
];
