import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

const ICON_HEIGHT = 188;

@Component({
  selector: 'app-spinner',
  imports: [
    CommonModule
  ],
  templateUrl: './spinner.html',
  styleUrl: './spinner.scss'
})
export class Spinner {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;

  // Settings
  private text: string = 'HELLO';
  private chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private scale: number = 50;
  private breaks: number = 0.003;
  private endSpeed: number = 0.05;
  private firstLetter: number = 220;
  private delay: number = 40;

  private charMap: Record<string, number> = {};
  private offset: number[] = [];
  private offsetV: number[] = [];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.initAnimation();
    this.onResize();
    window.addEventListener('resize', this.onResize);
    this.animationId = requestAnimationFrame(this.loop);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.onResize);
  }

  private initAnimation() {
    const textArr = this.text.split('');
    const charsArr = this.chars.split('');

    this.charMap = {};
    charsArr.forEach((c, i) => (this.charMap[c] = i));

    this.offset = [];
    this.offsetV = [];
    textArr.forEach((_, i) => {
      const f = this.firstLetter + this.delay * i;
      this.offsetV[i] = this.endSpeed + this.breaks * f;
      this.offset[i] = -(1 + f) * (this.breaks * f + 2 * this.endSpeed) / 2;
    });
  }

  private onResize = () => {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };

  private loop = () => {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#622';
    ctx.fillRect(0, (canvas.height - this.scale) / 2, canvas.width, this.scale);

    const textArr = this.text.split('');
    for (let i = 0; i < textArr.length; i++) {
      ctx.fillStyle = '#ccc';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.setTransform(
        1,
        0,
        0,
        1,
        Math.floor((canvas.width - this.scale * (textArr.length - 1)) / 2),
        Math.floor(canvas.height / 2)
      );

      let o = this.offset[i];
      while (o < 0) o++;
      o %= 1;
      const h = Math.ceil(canvas.height / 2 / this.scale);
      for (let j = -h; j < h; j++) {
        let c =
          this.charMap[textArr[i]] + j - Math.floor(this.offset[i]);
        while (c < 0) c += this.chars.length;
        c %= this.chars.length;
        const s = 1 - Math.abs(j + o) / (canvas.height / 2 / this.scale + 1);
        ctx.globalAlpha = s;
        ctx.font = this.scale * s + 'px Helvetica';
        ctx.fillText(this.chars[c], this.scale * i, (j + o) * this.scale);
      }

      this.offset[i] += this.offsetV[i];
      this.offsetV[i] -= this.breaks;
      if (this.offsetV[i] < this.endSpeed) {
        this.offset[i] = 0;
        this.offsetV[i] = 0;
      }
    }

    this.animationId = requestAnimationFrame(this.loop);
  };
}