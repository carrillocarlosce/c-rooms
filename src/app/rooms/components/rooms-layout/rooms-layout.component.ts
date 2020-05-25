import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { HomeComponent } from '../../pages/home/home.component';

@Component({
  selector: 'app-rooms-layout',
  templateUrl: './rooms-layout.component.html',
  styleUrls: ['./rooms-layout.component.scss']
})
export class RoomsLayoutComponent implements OnInit {
  isHandset = this.breakpoint.observe(Breakpoints.Handset);
  title: string;
  showCreateRoom: boolean;

  constructor(
    private breakpoint: BreakpointObserver,
  ) { }

  ngOnInit(): void {

  }

  routeChange(ev: any) {
    this.showCreateRoom = ev instanceof HomeComponent;

    this.title = ev.title || 'cRooms';
  }

}
