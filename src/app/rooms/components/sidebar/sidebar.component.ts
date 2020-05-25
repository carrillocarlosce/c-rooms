import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Observable } from 'rxjs';
import { UserProfile } from 'src/app/common/classes/user-profile.class';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  userProfile$: Observable<UserProfile>;


  constructor(
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    this.userProfile$ = this.authService.userProfile$;
  }
  logout() {
    this.authService.logout();
  }
}
