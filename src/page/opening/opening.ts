import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Component, inject, signal } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Subscription } from 'rxjs';

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
    QRCodeComponent
  ],
  templateUrl: './opening.html',
  styleUrl: './opening.scss',
})
export class Opening {

  showInfo = signal<boolean>(false);
  showQRCode = signal<boolean>(false);
  QRCodeValueDev = signal<string>('http://localhost:4200/opening-pop-energy');
  QRCodeValueProd = signal<string>('https://bug9best.github.io/SPPHSlot/opening-pop-energy');

  private firestore: Firestore = inject(Firestore);
  private statusSub!: Subscription;

  scanCount = signal<number>(0);
  targetScans = signal<number>(100);
  energyPercent = signal<number>(0);

  ngOnInit() {
    this.listenToCeremonyStatus();
  }

  ngOnDestroy() {
    // ยกเลิกการติดตามเมื่อเปลี่ยนหน้า เพื่อป้องกัน Memory Leak
    if (this.statusSub) {
      this.statusSub.unsubscribe();
    }
  }

  private listenToCeremonyStatus() {
    // อ้างอิงไปยัง Document: ceremony/status
    const statusDocRef = doc(this.firestore, 'ceremony', 'status');

    // ใช้ docData เพื่อรับข้อมูลแบบ Realtime (Observable)
    this.statusSub = docData(statusDocRef).subscribe((data: any) => {
      if (data) {
        const status = data as CeremonyStatus;

        // อัปเดตค่า Signal ตามข้อมูลจาก Firestore
        this.scanCount.set(status.energy);
        this.targetScans.set(status.maxEnergy);

        // คำนวณเปอร์เซ็นต์
        this.calculateEnergy();

        // **ส่วนเสริม**: คุณสามารถเอา status.ceremonyStarted หรือ vipScanned ไปใช้ต่อได้ เช่น
        // if (status.vipScanned) { this.playWinEffect(); }
      }
    });
  }

 private calculateEnergy(): void {
    // ป้องกันการหารด้วยศูนย์
    const max = this.targetScans() > 0 ? this.targetScans() : 100;
    
    // คำนวณเปอร์เซ็นต์แบบดิบๆ (มีทศนิยม)
    let rawPercent = (this.scanCount() / max) * 100;

    // บังคับปัดเศษทิ้งเสมอ (เช่น 99.66 จะกลายเป็น 99) 
    // เพื่อไม่ให้มันโชว์ 100% จนกว่าจะถึง 100 จริงๆ
    let percent = Math.floor(rawPercent);

    // ป้องกันค่าเกิน 100 (เผื่อกรณีคนสแกนเกิน)
    percent = Math.min(percent, 100); 

    this.energyPercent.set(percent);
  }

  get clipPathInset(): string {
    const topCapHeight = 23;
    const bottomBaseHeight = 32;

    const emptyInset = 100 - bottomBaseHeight;
    const fullInset = topCapHeight;

    // ดึงค่าจาก Signal โดยใช้ ()
    const currentPercent = this.energyPercent();
    const currentInset = emptyInset - (currentPercent / 100) * (emptyInset - fullInset);

    return `inset(${currentInset}% 0 0 0)`;
  }

  // ฟังก์ชันนี้เก็บไว้ใช้เทสต์ปุ่มจำลองได้ครับ แต่ถ้าต่อ Firebase แล้ว ค่าจะมาจากฐานข้อมูลโดยตรง
  mockScan(): void {
    /* ถ้าต้องการให้ปุ่มนี้กดแล้วอัปเดตไปที่ Firebase ด้วย 
      ต้องใช้ฟังก์ชัน updateDoc ของ Firestore ครับ
    */
  }



  // get clipPathInset(): string {
  //   const topCapHeight = 23;    // พื้นที่ฝาด้านบนตีเป็นกี่ % ของความสูงรูป (ลองกะประมาณดู เช่น 18%)
  //   const bottomBaseHeight = 32; // พื้นที่ฐานด้านล่างตีเป็นกี่ % ของความสูงรูป (เช่น 22%)

  //   const emptyInset = 100 - bottomBaseHeight; // ตอน 0% ต้องตัดข้างบนออกถึงขอบฐาน (เช่น 100 - 22 = 78%)
  //   const fullInset = topCapHeight;            // ตอน 100% ตัดออกแค่ขอบฝาบน (เช่น 18%)

  //   const currentInset = emptyInset - (this.energyPercent / 100) * (emptyInset - fullInset);
  //   return `inset(${currentInset}% 0 0 0)`;
  // }

  // mockScan(): void {
  //   if (this.scanCount < this.targetScans) {
  //     this.scanCount = Math.min(this.scanCount + 5, this.targetScans);
  //     this.calculateEnergy();
  //   }
  // }

  // private calculateEnergy(): void {
  //   this.energyPercent = (this.scanCount / this.targetScans) * 100;
  // }
}