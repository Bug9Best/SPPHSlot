import { Component } from '@angular/core';

@Component({
  selector: 'app-opening-grand',
  imports: [],
  templateUrl: './opening-grand.html',
  styleUrl: './opening-grand.scss',
})
export class OpeningGrand {

  private currentAudio: HTMLAudioElement | null = null;

  ngOnInit() {
    this.playSound('epic2.mp3');
  }

  ngOnDestroy() {
    console.log('OpeningGrand component is being destroyed. Stopping music.');
    this.pauseSound('epic2.mp3');
  }

  private playSound(file: string) {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }

    this.currentAudio = new Audio(`sounds/${file}`);
    this.currentAudio.volume = Math.max(0, Math.min(1, 0.5));
    this.currentAudio.loop = true;
    this.currentAudio.play();
  }

  private pauseSound(file: string) {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

}
