import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DividerModule } from 'primeng/divider';
import { UsersService } from '../../service/users';

@Component({
  selector: 'app-detail',
  imports: [
    DividerModule
  ],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class Detail {

  userUUID: string = "";
  userData: any = {};


  constructor(
    private activateRoute: ActivatedRoute,
    private usersService: UsersService
  ) {
    this.activateRoute.params.subscribe(params => {
      const userId = params['uid'];
      this.userUUID = userId;
      this.loadUserData(this.userUUID);
    });
  }

  loadUserData(UUID: string) {
    this.usersService.getUserByUUID(UUID).subscribe({
      next: (user) => {
        if (user) {
          this.userData = user;
          console.log("User data loaded:", this.userData);
        } else {
          console.error("User not found");
        }
      },
      error: (error) => {
        console.error("Error loading user data:", error);
      }
    });
  }
}
