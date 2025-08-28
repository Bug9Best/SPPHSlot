import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RoomsService } from '../../service/rooms';
import { KeyFilterModule } from 'primeng/keyfilter';
import { RegistrationsService } from '../../service/registrations';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-join',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    KeyFilterModule,
    DividerModule,
    DialogModule
  ],
  templateUrl: './join.html',
  styleUrl: './join.scss'
})
export class Join {

  doneVisible: boolean = false;

  roomUUID: string = '';
  roomData?: any = {};
  registrationData: any = {};

  formGroup = new FormGroup({
    luckyNumber: new FormControl('', Validators.required),
  });

  constructor(
    private messageService: MessageService,
    private activateRoute: ActivatedRoute,
    private roomService: RoomsService,
    private registrationsService: RegistrationsService
  ) {
    this.activateRoute.queryParams.subscribe(params => {
      this.roomUUID = params['room'];
      this.getRoomData();
    });
  }

  getRoomData() {
    this.roomService.getRoomsByUUID(this.roomUUID)
      .subscribe(room => {
        this.roomData = room;
      });
  }

  showMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      key: 'app',
      severity: severity,
      summary: summary,
      detail: detail
    });
  }

  router = inject(Router);
  JoinRoom() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.showMessage('warn', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    let values = {
      ...this.formGroup.value,
      roomUUID: this.roomUUID
    };

    this.registrationsService
      .registrations$(values)
      .subscribe({
        next: (ref) => {
          this.formGroup.reset();
          this.doneVisible = true;
          this.registrationData = ref;
        },
        error: (err) => {
          this.showMessage('warn', 'ลงทะเบียนไม่สำเร็จ', err.message);
        }
      });
  }
}
