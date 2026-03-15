import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule,
    RouterLink,
    DividerModule
],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
