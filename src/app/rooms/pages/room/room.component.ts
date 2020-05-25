import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { RoomService, IRoom } from './room.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { filter, map, switchMap, tap, take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnDestroy {
  title = 'New Room';
  myVideoRef: ElementRef<HTMLVideoElement>;
  myVideoStream: MediaStream;
  isHandset = this.breakpoint.observe(Breakpoints.Handset);

  remoteVideoRef: ElementRef<HTMLVideoElement>;
  remoteVideoStream = new MediaStream();
  peerConnection: RTCPeerConnection;
  rtcConfiguration: RTCConfiguration = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302'
      }
    ]
  };
  constructor(
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private breakpoint: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    this.getIdFromRoute$
      .pipe(
        switchMap(id => this.roomService.getRoom(id)),
        tap((room) => this.handleNoRoom(room)),
        filter(room => !!room),
        switchMap(room => this.mapHostForRoom$(room))
      )
      .subscribe((room) => this.handleRoom(room));
  }

  get getIdFromRoute$() {
    return this.route.params.pipe(
      map<Params, string>(params => params.id)
    );
  }

  mapHostForRoom$(room: IRoom) {
    return this.authService.getUser$()
      .pipe(
        map(user => {
          let isHost = !!user;
          if (user) {
            isHost = user.email === room.host.email;
          }
          return {
            ...room,
            isHost
          };
        })
      );
  }

  async handleRoom(room: IRoom) {
    if (room.isHost) {
      this.startRoom(room);
    } else {
      this.joinRoom(room);
    }
  }

  handleNoRoom(room: IRoom) {
    if (!room) {
      this.router.navigate(['/']);
    }
  }

  async startLocalVideo() {
    try {
      this.myVideoStream = await this.roomService.openMediaDevices({
        video: true,
        audio: true,
      });
      this.renderVideo(this.myVideoRef.nativeElement, {
        muted: true,
        srcObject: this.myVideoStream
      });
      this.renderVideo(this.remoteVideoRef.nativeElement, {
        srcObject: this.remoteVideoStream
      });
      console.log('Got MediaStream:', this.myVideoStream);
    } catch (error) {
      console.error('Error accessing media devices.', error);
      throw error;
    }
  }

  renderVideo(
    videoElement: HTMLVideoElement,
    options: Partial<HTMLVideoElement> = {}
  ) {
    const videoOptions: Partial<HTMLVideoElement> = {
      autoplay: true,
      ...options
    };
    Object.assign(videoElement, videoOptions);
  }


  @ViewChild('myVideo')
  set content(videoEl: ElementRef) {
    if (videoEl) {
      this.myVideoRef = videoEl;
    }
  }

  @ViewChild('remoteVideo')
  set remoteContent(videoEl: ElementRef) {
    if (videoEl) {
      this.remoteVideoRef = videoEl;
    }
  }

  async startRoom(room: IRoom) {
    await this.startLocalVideo();
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    this.registerPeerConnectionListeners(room);

    this.addLocalStreamToPeerConnection();

    // Listen ICE Candidates
    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got Caller candidate: ', event.candidate);
      this.roomService.addCallerCandidate(event.candidate, room.id);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    const room$ = await this.roomService.createOffer(offer, room);

    // Listing peerConnection tracks and add to remoteStream
    this.listenRemoteTracks();

    // listen to Answer
    room$.pipe(
      filter(data => {
        return !this.peerConnection.currentRemoteDescription && data.answer;
      })
    ).subscribe(async (data) => {
      console.log('Got remote description: ', data.answer);
      const rtcSessionDescription = new RTCSessionDescription(data.answer);
      await this.peerConnection.setRemoteDescription(rtcSessionDescription);
    });

    // Listen to callee candidates
    this.roomService.callee$
      .subscribe(async (data) => {
        console.log(`Got new remote ICE candidate (callee): ${JSON.stringify(data)}`);
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
      });
  }

  async joinRoom(room: IRoom) {
    console.log('Got room:', room);
    await this.startLocalVideo();
    this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    this.registerPeerConnectionListeners(room);
    this.addLocalStreamToPeerConnection();

    this.peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got Callee candidate: ', event.candidate);
      this.roomService.addCalleeCandidate(event.candidate, room.id);
    });
    // Listing peerConnection tracks and add to remoteStream
    this.listenRemoteTracks();
    const offer = room.offer;
    console.log('Got offer:', offer);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await this.peerConnection.setLocalDescription(answer);

    await this.roomService.createAnswer(answer, room.id);
    this.roomService.caller$
      .subscribe(async (data) => {
        console.log(`Got new remote ICE candidate (caller): ${JSON.stringify(data)}`);
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
      });
  }

  listenRemoteTracks() {
    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        this.remoteVideoStream.addTrack(track);
      });
    });
  }

  addLocalStreamToPeerConnection() {
    // Add localStream tracks to peer connection
    this.myVideoStream.getTracks()
      .forEach(track => {
        this.peerConnection.addTrack(track, this.myVideoStream);
      });
  }

  async hangUp(room: IRoom) {

    if (this.myVideoStream) {
      this.myVideoStream.getTracks().forEach((track) => track.stop());
    }
    if (this.remoteVideoStream) {
      this.remoteVideoStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.roomService.deleteRoom(room);

  }

  async ngOnDestroy() {
    this.hangUp(await this.roomService.room$.pipe(take(1)).toPromise());
  }

  registerPeerConnectionListeners(room: IRoom) {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      if (this.peerConnection.connectionState === 'disconnected') {
        this.hangUp(room);
      }
      console.log(`Connection state change: ${this.peerConnection.connectionState}`);
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(
        `ICE connection state change: ${this.peerConnection.iceConnectionState}`);
    });
  }

}
