import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoomComponent } from './pages/room/room.component';
import { RoomsLayoutComponent } from './components/rooms-layout/rooms-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { HostComponent } from './pages/host/host.component';
import { AuthGuard } from '../guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: RoomsLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'host',
        component: HostComponent,
        canActivate: [
          AuthGuard
        ]
      },
      {
        path: 'room/:id',
        component: RoomComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoomsRoutingModule { }
