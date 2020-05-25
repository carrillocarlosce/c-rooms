import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot, AngularFirestoreCollection } from '@angular/fire/firestore';
import { take, map, filter, switchMap } from 'rxjs/operators';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { UserProfile } from 'src/app/common/classes/user-profile.class';
import { AuthService } from 'src/app/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
export interface IRoom {
  name: string;
  offer?: any;
  answer?: any;
  id?: string;
  isHost?: boolean;
  host?: {
    name: string;
    email: string;
  };
}
@Injectable({
  providedIn: 'root'
})
export class RoomService {


  roomSource = new BehaviorSubject<IRoom>(null);
  room$ = this.roomSource.asObservable();

  calleeSource = new BehaviorSubject<any>(null);
  callee$ = this.calleeSource.asObservable()
    .pipe(filter(item => !!item));
  callerSource = new BehaviorSubject<any>(null);
  caller$ = this.callerSource.asObservable()
    .pipe(filter(item => !!item));

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  async openMediaDevices(constraints: MediaStreamConstraints) {
    try {

      return navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.log(error);
      this.snackBar.open('Error accessing media devices!', 'k', {
        duration: 3000
      });
      throw error;
    }
  }
  getRoom(id: string) {
    const room = this.firestore.collection('rooms').doc<IRoom>(id);
    return room.get().pipe(
      map<DocumentSnapshot<IRoom>, IRoom>(item => {
        if (!item.exists) {
          return null;
        }
        return {
          ...item.data(),
          id: item.id
        };
      })
    );
  }

  createRoom(name: string) {
    this.snackBar.open('Creating Room...', '', {
      duration: 1000
    });
    return this.authService.getUser$().pipe(
      take(1),
      switchMap(user => {
        const room: IRoom = {
          name,
          host: {
            email: user.email,
            name: user.fullname,
          }
        };
        return from(this.firestore.collection<IRoom>(`rooms`).add(room));
      }),
      map((room) => {
        return room.id;
      })
    );
  }

  async deleteRoom(room: IRoom) {
    if (!room) {
      return;
    }
    const roomRef = this.firestore.collection('rooms').doc(room.id);
    const calleeCandidates = roomRef.collection('calleeCandidates').get();
    calleeCandidates.forEach(async (candidate) => {
      candidate.forEach(async (item) => await item.ref.delete());
    });
    const callerCandidates = roomRef.collection('callerCandidates').get();
    callerCandidates.forEach(async (candidate) => {
      candidate.forEach(async (item) => await item.ref.delete());
    });
    await roomRef.delete();
  }
  async createAnswer(answer: RTCSessionDescriptionInit, roomId: string) {
    await this.firestore.doc<IRoom>(`rooms/${roomId}`)
      .update({
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      });
    this.firestore.doc(`rooms/${roomId}`)
      .collection('callerCandidates')
      .stateChanges(['added'])
      .subscribe((snapshot) => {
        snapshot.forEach(element => {
          this.callerSource.next(element.payload.doc.data());
        });
      });
  }

  addCalleeCandidate(candidate: RTCIceCandidate, roomId: string) {
    console.log('add callee candidate');
    this.firestore.doc(`rooms/${roomId}`)
      .collection('calleeCandidates').add(candidate.toJSON());
  }
  addCallerCandidate(candidate: RTCIceCandidate, roomId: string) {
    this.firestore.doc(`rooms/${roomId}`)
      .collection('callerCandidates').add(candidate.toJSON());
  }




  async createOffer(offer: RTCSessionDescriptionInit, room: IRoom) {
    const offerDb = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      }
    };
    // await this.firestore.doc(`rooms/testingRoom`).delete();
    const roomDb = this.firestore.collection('rooms').doc<IRoom>(room.id);
    await roomDb.update(offerDb);
    roomDb
      .collection('calleeCandidates')
      .stateChanges(['added'])
      .subscribe((snapshot) => {
        snapshot.forEach(element => {
          this.calleeSource.next(element.payload.doc.data());
        });
      })
    roomDb.snapshotChanges()
      .subscribe((item) => {
        this.roomSource.next({
          ...item.payload.data(),
          id: item.payload.id,
        });
      });
    return this.room$.pipe(
      filter((item) => !!item)
    );
  }
}
