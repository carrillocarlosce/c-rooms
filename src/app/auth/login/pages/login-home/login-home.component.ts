import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { AuthConnection } from 'src/app/common/constants';
import { ActivatedRoute } from '@angular/router';
import { pipe } from 'rxjs';

@Component({
  selector: 'app-login-home',
  templateUrl: './login-home.component.html',
  styleUrls: ['./login-home.component.scss']
})
export class LoginHomeComponent implements OnInit {
  redirect: string;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe((params) => {
        this.redirect = params.redirect || '/';
        console.log(this.redirect);
      });
  }

  loginWithLinkedin() {
    this.authService.login(this.redirect, AuthConnection.Linkedin);
  }

  loginWithGoogle() {
    this.authService.login(this.redirect, AuthConnection.Google);
  }


}
