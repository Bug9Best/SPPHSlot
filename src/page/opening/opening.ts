import { Firestore, doc, setDoc, docData, increment } from '@angular/fire/firestore';
import { Component, inject, signal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';
import { Router } from "@angular/router";

interface CeremonyStatus {
  energy: number;
  maxEnergy: number;
  ceremonyStarted: boolean;
  chiefAction: boolean;
}

@Component({
  selector: 'app-opening',
  imports: [
    CommonModule,
    ButtonModule,
    QRCodeComponent,
  ],
  templateUrl: './opening.html',
  styleUrl: './opening.scss',
})
export class Opening {

  showInfo = signal<boolean>(false);
  showQRCode = signal<boolean>(false);
  isFadingOut = signal<boolean>(false);
  QRCodeValueDev = signal<string>('http://localhost:4200/opening-pop-energy');
  QRCodeValueProd = signal<string>('https://bug9best.github.io/SPPHSlot/opening-pop-energy');

  private statusSub!: Subscription;
  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);

  scanCount = signal<number>(0);
  targetScans = signal<number>(100);
  energyPercent = signal<number>(0);

  ngOnInit() {
    this.listenToCeremonyStatus();
    this.playSound('epic.mp3');
  }

  ngOnDestroy() {
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  private playSound(file: string) {
    const audio = new Audio(`sounds/${file}`);
    audio.volume = Math.max(0, Math.min(1, 1));
    audio.play();
  }

  private listenToCeremonyStatus() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    this.statusSub = docData(statusDocRef).subscribe((data: any) => {
      if (data) {
        const status = data as CeremonyStatus;

        this.scanCount.set(status.energy);
        this.targetScans.set(status.maxEnergy);
        this.calculateEnergy();
      }
    });
  }

  private calculateEnergy(): void {
    const max = this.targetScans() > 0 ? this.targetScans() : 100;
    let rawPercent = (this.scanCount() / max) * 100;
    let percent = Math.floor(rawPercent);

    percent = Math.min(percent, 100);
    this.energyPercent.set(percent);
  }

  get clipPathInset(): string {
    const topCapHeight = 23;
    const bottomBaseHeight = 32;

    const emptyInset = 100 - bottomBaseHeight;
    const fullInset = topCapHeight;

    const currentPercent = this.energyPercent();
    const currentInset = emptyInset - (currentPercent / 100) * (emptyInset - fullInset);

    return `inset(${currentInset}% 0 0 0)`;
  }

  goToCeremony() {
    this.isFadingOut.set(true);
    setTimeout(() => {
      this.router.navigate(['/opening-ceremony']);
    }, 2000);
  }

  async decreaseEnergy() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    try {
      // ใช้ increment(-5) เพื่อบอกให้ Firebase หักลบค่า energy ลงทีละ 5
      await setDoc(statusDocRef, {
        energy: increment(-500)
      }, { merge: true });
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการลดพลังงาน:', error);
    }
  }

  async increaseEnergy() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');
    await setDoc(statusDocRef, {
      energy: increment(500)
    }, { merge: true }); 
  }
}