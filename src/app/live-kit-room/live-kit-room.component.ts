import { Component, OnInit } from '@angular/core';
import { Participant, RemoteTrack, Room, RoomEvent } from 'livekit-client';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-live-kit-room',
  templateUrl: './live-kit-room.component.html',
  styleUrls: ['./live-kit-room.component.scss'],
})
export class LiveKitRoomComponent {
  roomDetails: { wsURL: string; token: string } | null = null;
  nameForm!: FormGroup;
  isMeetingStarted = false;
  stream: MediaStream | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private livekitService: LiveKitService
  ) {
    this.nameForm = this.formBuilder.group({
      name: [''],
    });
  }
  ngOnInit() {
    this.livekitService.audioVideoHandler();
  }
  ngAfterViewInit(): void {
    this.livekitService.remoteVideoTrackSubscribed.subscribe((track) => {
      this.displayRemoteVideo(track);
    });
  }

  displayRemoteVideo(track: RemoteTrack): void {
    const container = document.getElementById('remoteVideoContainer');
    if (container) {
      const element = document.createElement('video');
      element.srcObject = new MediaStream([track.mediaStreamTrack]);
      element.autoplay = true;
      element.controls = false;
      container.appendChild(element);
    } else {
      console.error('Remote video container not found');
    }
  }
  async startMeeting() {
    const name = this.nameForm.value.name;
    console.log('Entered name:', name);
    const wsURL = 'wss://vc-ua59wquz.livekit.cloud';
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6IkFydGlzdCBSb29tIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzE0MTEwNTk3LCJuYmYiOjE3MTQxMTA1OTcsImV4cCI6MTcxNDEzMjE5NywiaXNzIjoiQVBJVVdiRUs3Qmd2NHVrIiwic3ViIjoiV2FyZGEiLCJqdGkiOiJXYXJkYSJ9.FSEJ4G-LGYTo5zAYSYb4GPoqkjA2yOpKTgDNVBNx-WA';
    try {
      await this.livekitService.connectToRoom(wsURL, token);
      await this.livekitService.enableCameraAndMicrophone();
      this.isMeetingStarted = true;
    } catch (error) {
      console.error('Error starting meeting:', error);
    }
  }
  async startCamera() {
    this.stream = await this.livekitService.startCamera();
  }

  // ==================== header
  participantSideWindowVisible = false;
  chatSideWindowVisible = false;
  isVideoOn = false;
  isMicOn = false;
  iconColor = 'black';
  isScreenRecording = true;
  recordingTime = '00:22:23';
  isScreenSharing = false;

  toggleScreenShare() {
    this.isScreenSharing = !this.isScreenSharing;
    if (this.isScreenSharing) {
      this.iconColor = 'green';
    } else {
      this.iconColor = 'black';
    }
  }
  async toggleVideo() {
    await this.livekitService.toggleVideo();
    this.isVideoOn = !this.isVideoOn;
    this.stream = await this.livekitService.startCamera();
  }

  // toggleMic() {
  //   this.isMicOn = !this.isMicOn;
  // }
  async toggleMic() {
    await this.livekitService.toggleMicrophone();
    this.isMicOn = !this.isMicOn;
    console.log('on/off', this.livekitService.toggleMicrophone);
  }
  openParticipantSideWindow() {
    this.participantSideWindowVisible = true;
    this.chatSideWindowVisible = false;
  }
  closeParticipantSideWindow() {
    this.participantSideWindowVisible = false;
  }
  openChatSideWindow() {
    this.chatSideWindowVisible = true;
    this.participantSideWindowVisible = false;
  }
  closeChatSideWindow() {
    this.chatSideWindowVisible = false;
  }
}
