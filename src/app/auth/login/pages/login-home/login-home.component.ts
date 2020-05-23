import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthConnection } from 'src/app/common/constants';

@Component({
  selector: 'app-login-home',
  templateUrl: './login-home.component.html',
  styleUrls: ['./login-home.component.scss']
})
export class LoginHomeComponent implements OnInit {

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {

  }

  loginWithLinkedin() {
    this.authService.login('/', AuthConnection.Linkedin);
  }

  loginWithGoogle() {
    this.authService.login('/', AuthConnection.Google);
  }


}
