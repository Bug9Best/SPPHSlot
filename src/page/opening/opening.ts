import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-opening',
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './opening.html',
  styleUrl: './opening.scss',
})
export class Opening {
  scanCount = 0;
  targetScans = 100;
  energyPercent = 0;

  mockScan(): void {
    if (this.scanCount < this.targetScans) {
      this.scanCount = Math.min(this.scanCount + 5, this.targetScans);
      this.calculateEnergy();
    }
  }

  private calculateEnergy(): void {
    this.energyPercent = (this.scanCount / this.targetScans) * 100;
  }

  showQRCode() {
    console.log('เปิด Modal แสดง QR Code ที่นี่');
    // คุณสามารถใช้ DialogService ของ PrimeNG มาแสดงผลต่อได้
  }
}