import { Component } from '@angular/core';
import { Winners, WinnerService } from '../../service/winner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-winner',
  imports: [RouterLink],
  templateUrl: './winner.html',
  styleUrl: './winner.scss'
})
export class Winner {

  listWinners: Winners[] = [];

  constructor(
    private WinnerService: WinnerService
  ) { }

  ngOnInit(): void {
    this.getWinners();
  }

  getWinners(): void {
    this.WinnerService.getWinners().subscribe((winners) => {
      this.listWinners = winners;
      console.log(this.listWinners);
    });
  }

  print() {
    window.print();
  }
}
