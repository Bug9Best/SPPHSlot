import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QRCodeComponent } from 'angularx-qrcode';
import { Rooms, RoomsService } from '../../service/rooms';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { RegistrationsService } from '../../service/registrations';
import { Winners, WinnerService } from '../../service/winner';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-room',
  imports: [
    CommonModule,
    RouterLink,
    DialogModule,
    DividerModule,
    QRCodeComponent,
    ButtonModule
  ],
  templateUrl: './room.html',
  styleUrl: './room.scss'
})
export class Room {

  contentMode: 'qrcode' | 'game' = 'qrcode';

  isCountDown: boolean = false;
  time: string = '';
  countdown: number = 60;
  intervalClock: any;
  intervalCountdown: any;

  domain: string = 'https://bug9best.github.io/SPPHSlot'; // 'http://localhost:4200'
  roomUUID: string = '';
  qrCode = 'Your QR code data';

  roomData?: Rooms = <any>{};

  listUsers: any[] = [];
  listWinners: Winners[] = [];
  winnerUser: any = {};
  usersVisible: boolean = false;
  dialogVisible: boolean = false;
  winnersVisible: boolean = false;

  maxNumber: number = 500;
  result: string = '000';
  slots: string[] = ['0', '0', '0'];
  spinning: boolean = false;

  numbers: string[] = Array.from({ length: 200 }, (_, i) => (i % 10).toString());
  slotHeight = 350;
  reelTransforms: string[] = ['translateY(0)', 'translateY(0)', 'translateY(0)'];
  reelDurations: string[] = ['4.5s', '4.5s', '4.5s'];


  constructor(
    private activateRoute: ActivatedRoute,
    private roomService: RoomsService,
    private winnerService: WinnerService,
    private registrationsService: RegistrationsService
  ) {
    this.activateRoute.params.subscribe(params => {
      this.roomUUID = params['id'];
      this.qrCode = `${this.domain}/join?room=${this.roomUUID}`;
    });

    this.getRoomsByUUID();
    this.getWinnersByRoomUUID();
    this.getRegistrationByRoom();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalClock);
    clearInterval(this.intervalCountdown);
  }

  getRoomsByUUID() {
    this.roomService
      .getRoomsByUUID(this.roomUUID)
      .subscribe(room => {
        this.roomData = room;

        if (this.roomData?.isCondition === true) {
          this.contentMode = 'game';
        }
      });
  }

  getWinnersByRoomUUID() {
    this.winnerService
      .getWinnersByRoomUUID(this.roomUUID)
      .subscribe(winner => {
        this.listWinners = winner || [];
        console.log('winner', winner);
      });
  }

  getRegistrationByRoom() {
    this.registrationsService
      .getRegistrationByRoom(this.roomUUID)
      .subscribe(registrations => {
        this.listUsers = registrations;
        this.maxNumber = this.listUsers.length;
      });
  }

  spin() {
    if (this.spinning) return;

    this.playSound('spin.mp3');
    const random = Math.floor(Math.random() * this.maxNumber) + 1;
    this.result = this.listUsers[random - 1]?.luckyNumber || '000';
    this.spinning = true;
    this.winnerUser = this.listUsers.find((user) => {
      return user.luckyNumber === this.result;
    });

    this.animateSlots(this.result);
  }

  private playSound(file: string) {
    const audio = new Audio(`sounds/${file}`);
    audio.play();
  }
  private animateSlots(target: string) {
    const spinRounds = 8;

    for (let i = 0; i < 3; i++) {
      const digit = +target[i];
      const finalIndex = spinRounds * 10 + digit;
      const offset = -(finalIndex * this.slotHeight);

      const durationSec = 4.5 + i * (i * 0.5);
      this.reelDurations[i] = `${durationSec}s`;

      // เริ่มหมุน
      this.reelTransforms[i] = `translateY(${offset}px)`;

      // หลังหมุนจบ → รีเซ็ตตำแหน่ง
      setTimeout(() => {
        this.slots[i] = target[i];

        // ปิด transition ก่อนรีเซ็ต
        this.reelDurations[i] = '0s';

        // รีเซ็ตไปยังตำแหน่งจริง (ใกล้ๆ 0)
        this.reelTransforms[i] = `translateY(${-digit * this.slotHeight}px)`;

        // ใช้ requestAnimationFrame เพื่อให้ browser render ก่อน
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.reelDurations[i] = '4.5s'; // เปิด transition กลับมา
          });
        });

        if (i === 2) {
          this.spinning = false;
          this.playSound('winning.mp3'); // 🏆 เสียงชนะ
          this.triggerWinEffect();
          setTimeout(() => {
            this.dialogVisible = true;
          }, 2000);
        }
      }, durationSec * 1000);
    }
  }

  triggerWinEffect() {
    const slotEls = document.querySelectorAll('.slot');
    slotEls.forEach(el => {
      el.classList.add('win');
      setTimeout(() => el.classList.remove('win'), 2000); // ลบออกหลัง 2 วิ
    });
  }

  submitWinner() {
    this.winnerService
      .submitWinner$(this.winnerUser)
      .subscribe({
        next: () => {
          this.winnerUser = {};
          this.dialogVisible = false;
        }
      });
  }

  reserveTicket() {
    if (!this.roomData) return;

    this.registrationsService
      .reserveTicket$(this.roomData?.totalPrize, this.roomUUID)
      .subscribe({
        next: () => {
        }
      });
  }

  clearTicket() {
    if (!this.roomData) return;

    this.registrationsService
      .clearTicket$(this.roomUUID)
      .subscribe({
        next: () => {

        }
      });
  }

  updateRoomLock() {
    if (!this.roomData) return;

    let isLocked = !this.roomData.isLocked;
    this.roomService
      .updateRoomLock$(this.roomData.uuid, isLocked)
      .subscribe({
        next: () => {
          this.getRoomsByUUID();
        }
      });
  }

  startClock() {
    this.updateClock();
    this.intervalClock = setInterval(() => this.updateClock(), 1000);
  }

  updateClock() {
    const now = new Date();
    this.time = now.toLocaleTimeString('th-TH', { hour12: false });
  }

  // Countdown 1 นาที
  startCountdown() {
    this.isCountDown = true;
    this.countdown = 60;
    this.intervalCountdown = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  // ฟังก์ชันแปลงวินาทีเป็น mm:ss
  get countdownDisplay(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  }
}