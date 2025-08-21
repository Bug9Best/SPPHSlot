import { Routes } from '@angular/router';
import { CheckIn } from '../page/check-in/check-in';
import { JoinGame } from '../page/join-game/join-game';
import { GameRoom } from '../page/game-room/game-room';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/check-in',
        pathMatch: 'full'
    },
    {
        path: 'check-in',
        component: CheckIn
    },
    {
        path: 'join-game',
        component: JoinGame
    },
    {
        path: 'game-room',
        component: GameRoom
    },
];
