import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginHomeComponent } from './pages/login-home/login-home.component';
import { LoginRoutingModule } from './login-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [LoginHomeComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class LoginModule { }
