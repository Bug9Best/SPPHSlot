import { Component } from '@angular/core';
import { Users, UsersService } from '../../service/users';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-check-in',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DividerModule
  ],
  templateUrl: './check-in.html',
  styleUrl: './check-in.scss'
})
export class CheckIn {

  userData: any = {};
  stateCheckIn: 'START' | 'CREATE' | 'DETAIL' = 'START';

  listUsers: Users[] = [];

  formGroup = new FormGroup({
    prefix: new FormControl('', Validators.required),
    fname: new FormControl('', Validators.required),
    lname: new FormControl('', Validators.required),
  });

  constructor(
    private messageService: MessageService,
    private usersService: UsersService
  ) {
  }


  showMessage(severity: string, summary: string, detail: string) {
    this.messageService.add({
      key: 'app',
      severity: severity,
      summary: summary,
      detail: detail
    });
  }

  CheckInUser() {
    let values = this.formGroup.value

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.showMessage('warn', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    this.usersService.checkIn$(values).subscribe({
      next: (docRef) => {
        this.formGroup.reset();
        this.stateCheckIn = 'DETAIL';
        this.userData = { id: docRef.id, ...values };
      },
      error: (err) => {
        this.showMessage('warn', 'เกิดข้อผิดพลาด', err.message);
      }
    });
  }
}
