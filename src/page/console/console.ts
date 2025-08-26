import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { Rooms, RoomsService } from '../../service/rooms';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-console',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    TagModule,
    RouterLink
],
  templateUrl: './console.html',
  styleUrl: './console.scss'
})
export class Console {

  visible: boolean = false;
  currentMode: 'console' | 'room' | 'statistics' = 'console';

  listRoom: Rooms[] = [];

  formGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  constructor(
    private messageService: MessageService,
    private roomService: RoomsService
  ) { }

  ngOnInit() {
    this.roomService.getRooms().subscribe(rooms => {
      this.listRoom = rooms;
    });
  }

  switchMode(mode: 'console' | 'room' | 'statistics') {
    this.currentMode = mode;
  }

  showMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      key: 'app',
      severity: severity,
      summary: summary,
      detail: detail
    });
  }

  createRoom() {
    let values = this.formGroup.value;

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.showMessage('warn', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    this.roomService.CreateRoom$(values).subscribe({
      next: (docRef: any) => {
        this.formGroup.reset();
        this.visible = false;
      },
      error: (err) => {
        this.showMessage('warn', 'เกิดข้อผิดพลาด', err.message);
      }
    });
  }
}
