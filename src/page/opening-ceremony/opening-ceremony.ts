import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Firestore, doc, docData, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-opening-ceremony',
  imports: [
    ButtonModule,
    CommonModule
  ],
  templateUrl: './opening-ceremony.html',
  styleUrl: './opening-ceremony.scss',
})
export class OpeningCeremony {

  isChiefActionLocked = signal<boolean>(false);
  isCeremonyTriggered = signal<boolean>(false);

  private router = inject(Router);
  private firestore: Firestore = inject(Firestore);
  private statusSub!: Subscription;

  ngOnInit() {
    this.listenForChiefAction();
    this.listenToCeremonyStatus();
  }

  private listenToCeremonyStatus() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    this.statusSub = docData(statusDocRef).subscribe((data: any) => {
      if (data) {
        this.isChiefActionLocked.set(data.chiefActionLock);
      }
    });
  }

  private listenForChiefAction() {
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    this.statusSub = docData(statusDocRef).subscribe((data: any) => {
      if (data) {
        if (data.chiefAction === true && !this.isCeremonyTriggered()) {
          this.isCeremonyTriggered.set(true);
          this.playOpeningSequence();
        }
      }
    });
  }

  async triggerChiefAction() {
    const triggerRef = doc(this.firestore, 'ceremony', 'status');
    await setDoc(triggerRef, {
      chiefActionLock: this.isChiefActionLocked() ? false : true,
    }, { merge: true });
    this.isChiefActionLocked.set(!this.isChiefActionLocked());
  }

  async resetState() {
    const triggerRef = doc(this.firestore, 'ceremony', 'status');
    await setDoc(triggerRef, {
      chiefAction: false,
      chiefActionLock: true,
    }, { merge: true });
    this.isCeremonyTriggered.set(false);
    this.isChiefActionLocked.set(true);
    this.isFadingToWhite.set(false);
    this.accessGranted.nativeElement.style.opacity = '0';
    this.handPrint.nativeElement.style.display = 'none';
    this.labReady.nativeElement.style.display = 'block';
    this.labReady.nativeElement.style.filter = 'brightness(100%)';
  }

  @ViewChild('labReady') labReady!: ElementRef;
  @ViewChild('accessGranted') accessGranted!: ElementRef;
  @ViewChild('handPrint') handPrint!: ElementRef;
  @ViewChild('myVideo') myVideo!: ElementRef;
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  playOpeningSequence() {
    setTimeout(() => {
      if (this.labReady) this.labReady.nativeElement.style.filter = 'brightness(30%)';
      if (this.handPrint) this.handPrint.nativeElement.style.display = 'inline-block';
    }, 100);

    setTimeout(() => {
      this.handPrint.nativeElement.style.display = 'none';
      this.labReady.nativeElement.style.filter = 'brightness(100%)';
    }, 5000);

    setTimeout(() => {
      this.accessGranted.nativeElement.style.opacity = '1';
    }, 6000);

    setTimeout(() => {
      this.labReady.nativeElement.style.display = 'none';
    }, 7000);
  }

  playGrandOpening() {
    if (this.videoContainer && this.myVideo) {

      setTimeout(() => {
        if (this.accessGranted) this.accessGranted.nativeElement.style.opacity = '0';
      }, 100);

      setTimeout(() => {
        this.videoContainer.nativeElement.style.display = 'block';
      }, 500);

      setTimeout(() => {
        this.myVideo.nativeElement.play();
      }, 600); // ดีเลย์นิดนึงให้กล่องโชว์ก่อนค่อยเล่น
    }
  }

  isFadingToWhite = signal<boolean>(false);
  onVideoEnded() {
    console.log('🎬 วิดีโอเล่นจบแล้ว เตรียมสลับหน้า...');
    
    // สั่งให้ม่านสีขาวทำงาน (ค่อยๆ สว่างขึ้นทับวิดีโอ)
    this.isFadingToWhite.set(true);

    // หน่วงเวลา 2 วินาที (ให้เท่ากับเวลาของ Transition ใน CSS) ก่อนวาร์ปไปหน้าใหม่
    setTimeout(() => {
      this.router.navigate(['/opening-grand']); // เปลี่ยนไปหน้า opening-grand
    }, 2000);
  }
}
