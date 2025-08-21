import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-spinner-reel',
  imports: [],
  templateUrl: './spinner-reel.html',
  styleUrl: './spinner-reel.scss'
})
export class SpinnerReel {
  @Input() itemHeight = 90;
  items: number[] = [];

  async play(duration: number, maxNumber: number): Promise<number> {
    // สุ่มเลข 0–maxNumber
    const result = Math.floor(Math.random() * (maxNumber + 1));

    this.items = Array.from({ length: maxNumber + 1 }, (_, i) => i);

    await new Promise(res => setTimeout(res, duration));
    return result;
  }
}
