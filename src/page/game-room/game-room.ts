import { Component, QueryList, ViewChildren } from '@angular/core';
import { Spinner } from '../../component/spinner/spinner';


@Component({
  selector: 'app-game-room',
  imports: [
    Spinner
  ],
  templateUrl: './game-room.html',
  styleUrl: './game-room.scss'
})
export class GameRoom {

}
