import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Users, UsersService } from '../../service/users';
import { navyPrefix } from '../../data/prefix';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    DividerModule,
    InputTextModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  listPrefix = [...navyPrefix, { name: 'นาย' }, { name: 'นาง' }, { name: 'นางสาว' }];

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

  router = inject(Router);
  CheckInUser() {
    let values = this.formGroup.value


    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      this.showMessage('warn', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    this.usersService.checkIn$(values).subscribe({
      next: (docRef: any) => {
        this.formGroup.reset();
        this.router.navigate(['/detail/', docRef.uuid]);
      },
      error: (err) => {
        this.showMessage('warn', 'เกิดข้อผิดพลาด', err.message);
      }
    });
  }
}
