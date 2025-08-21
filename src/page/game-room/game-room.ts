import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { UsersService } from '../../service/users';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-game-room',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    DividerModule
  ],
  templateUrl: './game-room.html',
  styleUrl: './game-room.scss'
})
export class GameRoom {

  listUsers: any[] = [];
  winnerUser: any = {};
  usersVisible: boolean = false;
  dialogVisible: boolean = false;

  maxNumber: number = 500;
  result: string = '000';
  slots: string[] = ['0', '0', '0'];
  spinning: boolean = false;

  numbers: string[] = Array.from({ length: 200 }, (_, i) => (i % 10).toString());
  slotHeight = 350;
  reelTransforms: string[] = ['translateY(0)', 'translateY(0)', 'translateY(0)'];
  reelDurations: string[] = ['4.5s', '4.5s', '4.5s'];

  constructor(
    private usersService: UsersService
  ) {
  }

  ngOnInit() {
    this.usersService.getUsers().subscribe(users => {
      this.listUsers = users.map(user => ({
        id: user.id,
        prefix: user.prefix,
        fname: user.fname,
        lname: user.lname
      }));
      this.maxNumber = users.length;
    });
  }

  spin() {
    if (this.spinning) return;

    this.playSound('spin.mp3');
    const random = Math.floor(Math.random() * this.maxNumber) + 1;
    this.result = random.toString().padStart(3, '0');
    this.spinning = true;
    console.log('Spinning...', this.result);
    this.winnerUser = this.listUsers.find((user) => {
      return user.id === this.result;
    });
    console.log('Winner User:', this.winnerUser);

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
}