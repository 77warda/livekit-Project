import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import {
  selectAllMessages,
  selectChatSideWindowVisible,
  selectIconColor,
  selectIsMeetingStarted,
  selectIsMicOn,
  selectIsScreenSharing,
  selectIsVideoOn,
  selectParticipantSideWindowVisible,
  selectUnreadMessagesCount,
} from '../redux/selectors';
import * as LiveKitRoomActions from '../redux/actions';

const GRIDCOLUMN: { [key: number]: string } = {
  1: '1fr',
  2: '1fr 1fr',
  3: '1fr 1fr',
  4: '1fr 1fr',
  5: '1fr 1fr 1fr',
  6: '1fr 1fr 1fr',
};
@Component({
  selector: 'app-live-kit-room',
  templateUrl: './live-kit-room.component.html',
  styleUrls: ['./live-kit-room.component.scss'],
})
export class LiveKitRoomComponent {
  // selectors
  isMeetingStarted$!: Observable<boolean>;
  stream$!: Observable<MediaStream | undefined>;
  allMessages$!: Observable<any[]>;
  unreadMessagesCount$!: Observable<number>;
  isVideoOn$!: Observable<boolean>;
  isMicOn$!: Observable<boolean>;
  participantSideWindowVisible$!: Observable<boolean>;
  chatSideWindowVisible$!: Observable<boolean>;
  isScreenSharing$!: Observable<boolean>;
  iconColor$!: Observable<string>;
  private subscriptions: Subscription[] = [];
  @ViewChild('messageContainer') messageContainer!: ElementRef | any;
  attachedTrack: HTMLElement | null = null;

  // sharedLayout!: boolean;
  // withVideo!: boolean;
  // isScreenSharingEnabled: boolean = false;
  roomDetails: { wsURL: string; token: string } | null = null;
  startForm!: FormGroup;
  chatForm!: FormGroup;
  isMeetingStarted = false;
  stream: MediaStream | undefined;
  // localParticipantName: string = '';
  screenShareTrackSubscription!: Subscription;
  screenShareTrack!: RemoteTrack | undefined;
  // previousSenderName: string = '';
  unreadMessagesCount = 0;
  remoteParticipantNames: any;
  localParticipant: any;

  // ==================== header=========================
  participantSideWindowVisible = false;
  chatSideWindowVisible = false;
  isVideoOn = false;
  isMicOn = false;
  iconColor = 'black';
  isScreenRecording = true;
  recordingTime = '00:22:23';
  isScreenSharing = false;

  // allParticipants: RemoteParticipant[] = [];
  // receivedMessages: any[] = [];
  // messageSent: any[] = [];
  allMessages: any[] = [];
  room!: Room;

  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LiveKitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  ngOnInit() {
    this.livekitService.audioVideoHandler();
    // ========================
    this.isMeetingStarted$ = this.store.pipe(select(selectIsMeetingStarted));
    this.isScreenSharing$ = this.store.pipe(select(selectIsScreenSharing));
    this.iconColor$ = this.store.pipe(select(selectIconColor));
    this.isVideoOn$ = this.store.pipe(select(selectIsVideoOn));
    this.participantSideWindowVisible$ = this.store.pipe(
      select(selectParticipantSideWindowVisible)
    );
    this.chatSideWindowVisible$ = this.store.pipe(
      select(selectChatSideWindowVisible)
    );
    // this.stream$ = this.store.pipe(select(selectStream));
    // this.stream$.subscribe((stream) => {
    //   console.log('stream started', stream);
    // });
    this.allMessages$ = this.store.pipe(select(selectAllMessages));
    // this.allMessages$.subscribe((msg) => {
    //   console.log('msg started', msg);
    // });
    this.unreadMessagesCount$ = this.store.pipe(
      select(selectUnreadMessagesCount)
    );
    // this.unreadMessagesCount$.subscribe((msg) => {
    //   console.log('unread', msg);
    // });
    this.isMicOn$ = this.store.pipe(select(selectIsMicOn));

    // ==============================
    this.startForm = this.formBuilder.group({
      token: [''],
    });
    this.chatForm = this.formBuilder.group({
      message: [''],
      participant: [''],
    });
    // this.livekitService.msgDataReceived.subscribe((data) => {
    //   console.log('Received message:', data.message);
    //   console.log('Participant:', data.participant);

    //   const receivedMsg = data?.message?.message;
    //   const senderName = data?.participant?.identity;
    //   const receivingTime = data?.message?.timestamp;
    //   this.allMessages.push({
    //     senderName,
    //     receivedMsg,
    //     receivingTime,
    //     type: 'received',
    //   });
    //   if (!this.chatSideWindowVisible) {
    //     this.unreadMessagesCount++;
    //   }
    //   this.scrollToBottom();
    //   this.sortMessages();
    // });
    // this.livekitService.messageEmitter.subscribe((data: any) => {
    //   console.log('data', data);
    //   const sendMessage = data?.message;
    //   const sendingTime = data?.timestamp;
    //   this.allMessages.push({ sendMessage, sendingTime, type: 'sent' });
    //   this.sortMessages();
    //   this.scrollToBottom();
    // });
    this.subscriptions.push(
      this.livekitService.msgDataReceived.subscribe((data) => {
        console.log('Received message:', data.message);
        console.log('Participant:', data.participant);
        this.store.dispatch(
          LiveKitRoomActions.receiveMessage({
            message: data.message,
            participant: data.participant,
          })
        );
      })
    );

    this.subscriptions.push(
      this.livekitService.messageEmitter.subscribe((data: any) => {
        console.log('data', data);
        this.store.dispatch(
          LiveKitRoomActions.sendMessage({
            message: data.message,
            recipient: data.recipient,
          })
        );
      })
    );

    this.attachedTrack = this.livekitService.attachTrackToElement(
      Track,
      'remoteVideoContainer'
    );
    this.livekitService.participantNamesUpdated.subscribe((names: any) => {
      this.remoteParticipantNames = names;
      console.log('Participant names updated:', this.remoteParticipantNames);
    });

    this.livekitService.localParticipantData.subscribe((data: any) => {
      this.localParticipant = data;
      // this.localParticipant = data.find((p: any) => p.isLocal);
      console.log('local Participant name updated:', this.localParticipant);
    });
    if ((window as any).Cypress) {
      (window as any).livekitService = this.livekitService;
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  async startMeeting() {
    const dynamicToken = this.startForm.value.token;
    console.log('token is', dynamicToken);
    const wsURL = 'wss://warda-ldb690y8.livekit.cloud';
    const token = dynamicToken;
    this.store.dispatch(LiveKitRoomActions.startMeeting({ wsURL, token }));
  }
  async startCamera() {
    this.stream = await this.livekitService.startCamera();
  }

  extractInitials(name: any) {
    const words = name.split(' ').map((word: any) => word.charAt(0));
    return words.join('');
  }
  sortMessages() {
    this.allMessages.sort(
      (a, b) =>
        new Date(a.receivingTime || a.sendingTime).getTime() -
        new Date(b.receivingTime || b.sendingTime).getTime()
    );
  }
  // shouldShowAvatar(index: number): boolean {
  //   if (index === 0) {
  //     return true;
  //   }
  //   const currentMessage = this.allMessages[index];
  //   const previousMessage = this.allMessages[index - 1];
  //   return currentMessage.senderName !== previousMessage.senderName;
  // }

  sendMessage() {
    const msg = this.chatForm.value.message;
    const recipient = this.chatForm.value.participant;
    this.livekitService.sendChatMessage({ msg, recipient });

    this.chatForm.reset();
  }
  toggleRaiseHand() {
    if (this.localParticipant.handRaised) {
      this.livekitService.lowerHand(this.localParticipant);
    } else {
      this.livekitService.raiseHand(this.localParticipant);
    }
  }

  ngAfterViewInit(): void {
    this.screenShareTrackSubscription =
      this.livekitService.screenShareTrackSubscribed.subscribe(
        (track: RemoteTrack | undefined) => {
          // this.screenShareTrack = track.source === Track.Source.ScreenShare;
          // console.log('check condition', this.screenShareTrack);
          if (track && track.source === Track.Source.ScreenShare) {
            this.screenShareTrack = track;
            console.log('ss track', track);
          } else {
            this.screenShareTrack = undefined; // Reset to null if no screen share track
            console.log('else ss track', this.screenShareTrack);
          }
        }
      );
    this.livekitService.remoteVideoTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );
    this.livekitService.remoteAudioTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );

    this.livekitService.handRaised.subscribe((event) => {
      console.log('Hand raised event:', event);

      // Find the participant locally
      const localParticipant = this.localParticipant.find(
        (p: any) => p.identity === event.participant?.identity
      );

      // Find the participant remotely
      const remoteParticipant = this.remoteParticipantNames.find(
        (p: any) => p.identity === event.participant?.identity
      );

      // Update hand raise status for both local and remote participants
      if (localParticipant) {
        localParticipant.handRaised = event.handRaised;
      }

      if (remoteParticipant) {
        remoteParticipant.handRaised = event.handRaised;
      }

      // Show snackbar based on the hand raise event
      if (event.handRaised) {
        this.openSnackBar(`${event?.participant?.identity} raised hand`);
      } else {
        this.openSnackBar(`${event?.participant?.identity} lowered hand`);
      }
    });
  }

  async leaveBtn() {
    this.livekitService.disconnectRoom();
    this.isMeetingStarted = false;
    this.openSnackBar(`You Left the meeting`);
  }

  // ==================== header=========================
  async toggleScreenShare() {
    this.store.dispatch(LiveKitRoomActions.toggleScreenShare());
    // try {
    // } catch (error: any) {
    //   console.error('Error toggling video:', error);

    //   this.openSnackBar(`Error Screen Sharing: ${error.message}`);
    //   // Handle error (e.g., show an error message to the user)
    // }
  }

  async toggleVideo() {
    this.store.dispatch(LiveKitRoomActions.toggleVideo());

    // this.isVideoOn = !this.isVideoOn; // Toggle video state locally
    // try {
    //   await this.livekitService.toggleVideo();
    // } catch (error: any) {
    //   console.error('Error toggling video:', error);
    //   this.openSnackBar(`⁠Error toggling video: ${error.message}`);
    // }
  }

  async toggleMic() {
    this.store.dispatch(LiveKitRoomActions.toggleMic());
    // try {
    //   await this.livekitService.toggleMicrophone();
    //   // this.isMicOn$.subscribe(isMicOn => {
    //   //   this.store.dispatch(LiveKitRoomActions.toggleMicSuccess({ isMicOn: !isMicOn }));
    //   // });
    //   this.isMicOn = !this.isMicOn;
    //   console.log('on/off', this.livekitService.toggleMicrophone);
    // } catch (error: any) {
    //   console.error('Error toggling mic:', error);
    //   this.openSnackBar(`Error mic start: ${error.message}`);
    // }
  }
  openParticipantSideWindow() {
    // this.participantSideWindowVisible = true;
    // this.chatSideWindowVisible = false;
    this.store.dispatch(LiveKitRoomActions.toggleParticipantSideWindow());
  }
  openChatSideWindow() {
    // this.chatSideWindowVisible = !this.chatSideWindowVisible;
    // this.participantSideWindowVisible = false;
    this.store.dispatch(LiveKitRoomActions.toggleChatSideWindow());
    if (this.chatSideWindowVisible) {
      this.unreadMessagesCount = 0;
      this.scrollToBottom();
    }
  }
  closeChatSideWindow() {
    this.store.dispatch(LiveKitRoomActions.closeChatSideWindow());
  }
  closeParticipantSideWindow() {
    this.store.dispatch(LiveKitRoomActions.closeParticipantSideWindow());
  }
  get GalleryGridColumnStyle() {
    if (this.livekitService.room.numParticipants <= 6) {
      return GRIDCOLUMN[this.livekitService.room.numParticipants];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    } catch (err) {}
  }
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // duration in milliseconds
    });
  }
}
