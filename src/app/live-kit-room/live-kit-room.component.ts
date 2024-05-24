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
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  attachedTrack: HTMLElement | null = null;

  // sharedLayout!: boolean;
  // withVideo!: boolean;
  // isScreenSharingEnabled: boolean = false;
  roomDetails: { wsURL: string; token: string } | null = null;
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

  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LiveKitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.chatForm = this.formBuilder.group({
      message: [''],
    });

    this.livekitService.msgDataReceived.subscribe((data) => {
      console.log('Received message:', data.message);
      console.log('Participant:', data.participant);

      const receivedMsg = data?.message?.message;
      const senderName = data?.participant?.identity;
      const receivingTime = data?.message?.timestamp;
      this.allMessages.push({
        senderName,
        receivedMsg,
        receivingTime,
        type: 'received',
      });
      if (!this.chatSideWindowVisible) {
        this.unreadMessagesCount++;
      }
      this.scrollToBottom();
      this.sortMessages();
    });
    this.livekitService.messageEmitter.subscribe((data: any) => {
      console.log('data', data);
      const sendMessage = data?.message;
      const sendingTime = data?.timestamp;
      this.allMessages.push({ sendMessage, sendingTime, type: 'sent' });
      this.sortMessages();
      this.scrollToBottom();
    });

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
      console.log('local Participant name updated:', this.localParticipant);
    });
  }

  async startMeeting() {
    const wsURL = 'wss://vc-ua59wquz.livekit.cloud';
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ik5ldyBSb29tIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzE2NDY3NDIzLCJuYmYiOjE3MTY0Njc0MjMsImV4cCI6MTcxNjQ4OTAyMywiaXNzIjoiQVBJVVdiRUs3Qmd2NHVrIiwic3ViIjoiQWlzaGEiLCJqdGkiOiJBaXNoYSJ9.oibOT2ghOdOUfwqGrFNmcEN7zkwitcH1xi_PuVRmWaQ';
    try {
      await this.livekitService.connectToRoom(wsURL, token);
      this.isMeetingStarted = true;
    } catch (error: any) {
      console.error('Error starting meeting:', error);
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: `Error starting meeting. Token is invalid. Try Again with a different Token`,
        },
      });
      setTimeout(() => {
        this.isMeetingStarted = false;
      }, 3000);
    }
    try {
      await this.livekitService.enableCameraAndMicrophone();
    } catch (error: any) {
      console.error('Error starting meeting:', error);
      this.dialog.open(ErrorDialogComponent, {
        data: {
          message: `Error Connecting to Microphone and Camera`,
        },
      });
    }
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
  shouldShowAvatar(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.allMessages[index];
    const previousMessage = this.allMessages[index - 1];
    return currentMessage.senderName !== previousMessage.senderName;
  }
  sendMessage() {
    const msg = this.chatForm.value;
    this.livekitService.sendChatMessage({ msg });
    this.chatForm.reset();
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
  }

  // ngOnDestroy(): void {
  //   this.screenShareTrackSubscription.unsubscribe();
  // }

  async leaveBtn() {
    this.livekitService.disconnectRoom();
    this.isMeetingStarted = false;
    this.openSnackBar(`You Left the meeting`);
  }

  // ==================== header=========================
  async toggleScreenShare() {
    // if (this.livekitService.isRemoteScreenSharing$) {
    //   this.iconColor = 'grey';
    // }
    try {
      await this.livekitService.toggleScreenShare();
      this.isScreenSharing = !this.isScreenSharing;
      console.log('testing', this.isScreenSharing);
      if (this.isScreenSharing) {
        this.iconColor = 'green';
      } else {
        this.iconColor = 'black';
      }
      if (this.livekitService.remoteParticipantSharingScreen === true) {
        // this.isScreenSharingEnabled = false;
        this.isScreenSharing = false;
      }
    } catch (error: any) {
      console.error('Error toggling video:', error);

      this.openSnackBar(`Error Screen Sharing: ${error.message}`);
      // Handle error (e.g., show an error message to the user)
    }
  }

  async toggleVideo() {
    try {
      await this.livekitService.toggleVideo();
      const localParticipant = this.livekitService.room.localParticipant;
      this.isVideoOn =
        localParticipant.isCameraEnabled &&
        !localParticipant.getTrackPublication(Track.Source.Camera)?.isMuted;
      this.stream = await this.livekitService.startCamera();
    } catch (error: any) {
      console.error('Error toggling video:', error);
      this.openSnackBar(`Error video start: ${error.message}`);
    }
  }
  // async toggleVideo() {
  //   this.isVideoOn = !this.isVideoOn; // Toggle video state locally
  //   try {
  //     await this.livekitService.toggleVideo();
  //   } catch (error: any) {
  //     console.error('Error toggling video:', error);
  //     this.openSnackBar(`Error toggling video: ${error.message}`);
  //   }
  // }

  async toggleMic() {
    try {
      await this.livekitService.toggleMicrophone();
      this.isMicOn = !this.isMicOn;
      console.log('on/off', this.livekitService.toggleMicrophone);
    } catch (error: any) {
      console.error('Error toggling mic:', error);
      this.openSnackBar(`Error mic start: ${error.message}`);
    }
  }
  openParticipantSideWindow() {
    this.participantSideWindowVisible = true;
    this.chatSideWindowVisible = false;
  }
  closeParticipantSideWindow() {
    this.participantSideWindowVisible = false;
  }
  openChatSideWindow() {
    this.chatSideWindowVisible = !this.chatSideWindowVisible;
    this.participantSideWindowVisible = false;
    if (this.chatSideWindowVisible) {
      this.unreadMessagesCount = 0;
      this.scrollToBottom();
    }
  }
  closeChatSideWindow() {
    this.chatSideWindowVisible = false;
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
