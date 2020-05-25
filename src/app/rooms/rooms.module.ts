import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomsRoutingModule } from './rooms-routing.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RoomComponent } from './pages/room/room.component';
import { MatCardModule } from '@angular/material/card';
import { LayoutModule } from '@angular/cdk/layout';
import { RoomsLayoutComponent } from './components/rooms-layout/rooms-layout.component';
import { HostComponent } from './pages/host/host.component';
import { HomeComponent } from './pages/home/home.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
  declarations: [
    SidebarComponent,
    RoomComponent,
    RoomsLayoutComponent,
    HostComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    RoomsRoutingModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    LayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
  ],
})
export class RoomsModule { }
