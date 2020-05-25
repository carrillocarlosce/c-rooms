import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RoomService } from '../room/room.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit {
  title = 'Creating Room';
  previewStream: MediaStream;

  @ViewChild('videoPreview')
  videoPreview: ElementRef<HTMLVideoElement>;

  constructor(
    private roomService: RoomService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.previewVideo();
  }
  async previewVideo() {

    try {
      this.previewStream = await this.roomService.openMediaDevices({
        video: true,
      });
      this.videoPreview.nativeElement.srcObject = this.previewStream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  createRoom(name: string) {
    this.roomService.createRoom(name)
      .subscribe((roomId) => {
        this.router.navigate([`/rooms/room/${roomId}`]);
      });
  }
}
