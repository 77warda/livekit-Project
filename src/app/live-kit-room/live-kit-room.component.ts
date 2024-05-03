import { Component, Input, OnInit } from '@angular/core';
import {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from 'livekit-client';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-live-kit-room',
  templateUrl: './live-kit-room.component.html',
  styleUrls: ['./live-kit-room.component.scss'],
})
export class LiveKitRoomComponent {
  sharedLayout!: boolean;
  withVideo!: boolean;
  participants = [
    {
      name: 'GJ',
      dp: 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-22049.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'George John',
    },
    {
      name: 'GJ',
      title: 'John Doe',
    },
    {
      name: 'GJ',
      dp: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'Henry Peel',
    },
    {
      name: 'GJ',
      title: 'New one',
    },
    {
      name: 'GJ',
      dp: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'Henry Peel',
    },
    {
      name: 'GJ',
      dp: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'New one',
    },
    {
      name: 'GJ',
      title: 'Henry Peel',
    },
  ];
  images = [
    {
      src: 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-22049.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'George John',
    },
    {
      src: 'https://img.freepik.com/free-photo/beautiful-shot-snowy-mountains-with-dark-blue-sky_181624-2640.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'John Doe',
    },
    {
      src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'Henry Peel',
    },
    {
      src: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'New one',
    },
    {
      src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'Henry Peel',
    },
    {
      src: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'New one',
    },
    {
      src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
      title: 'Henry Peel',
    },
  ];

  roomDetails: { wsURL: string; token: string } | null = null;
  nameForm!: FormGroup;
  isMeetingStarted = false;
  stream: MediaStream | undefined;
  participantNameDisconnected: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private livekitService: LiveKitService
  ) {
    this.nameForm = this.formBuilder.group({
      name: [''],
    });
  }
  ngOnInit() {
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
  ngAfterViewInit(): void {
    // this.livekitService.remoteVideoTrackSubscribed.subscribe((track) => {
    //   this.displayRemoteVideo(track);
    // });
    // this.livekitService.remoteAudioTrackSubscribed.subscribe((track) => {
    //   // Handle remote audio track
    //   console.log('Received remote audio track:', track);
    //   this.displayRemoteAudio(track);
    //   // You can implement further logic here, such as playing the audio track
    // });
  }

  // displayRemoteVideo(track: RemoteTrack): void {
  //   const container = document.getElementById('remoteVideoContainer');
  //   if (container) {
  //     const element = document.createElement('video');
  //     element.srcObject = new MediaStream([track.mediaStreamTrack]);
  //     element.autoplay = true;
  //     element.controls = false;
  //     container.appendChild(element);
  //   } else {
  //     console.error('Remote video container not found');
  //   }
  // }
  // private displayRemoteAudio(track: RemoteTrack): void {
  //   const audioElement = document.createElement('audio');
  //   audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
  //   audioElement.autoplay = true;
  //   audioElement.controls = false;

  //   const container = document.getElementById('remoteAudioContainer');
  //   if (container) {
  //     container.appendChild(audioElement);
  //   } else {
  //     console.error('Remote audio container not found');
  //   }
  // }

  async startMeeting() {
    const name = this.nameForm.value.name;
    console.log('Entered name:', name);
    const wsURL = 'wss://vc-ua59wquz.livekit.cloud';
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6InRodXJzZGF5IEV2ZSIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZX0sImlhdCI6MTcxNDY1MDY5NCwibmJmIjoxNzE0NjUwNjk0LCJleHAiOjE3MTQ2NzIyOTQsImlzcyI6IkFQSVVXYkVLN0JndjR1ayIsInN1YiI6IkFiZCIsImp0aSI6IkFiZCJ9.Ujuxz73c8A8gGYUYvPzB9mzX4t7TI4FbyPt_cwjNteQ';
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

  // toggleScreenShare() {
  //   this.isScreenSharing = !this.isScreenSharing;
  //   if (this.isScreenSharing) {
  //     this.iconColor = 'green';
  //     this.livekitService.startScreenSharing();
  //   } else {
  //     this.iconColor = 'black';
  //   }
  // }
  async toggleScreenShare() {
    this.isScreenSharing = !this.isScreenSharing;
    if (this.isScreenSharing) {
      this.iconColor = 'green';
    } else {
      this.iconColor = 'black';
    }
    try {
      await this.livekitService.toggleScreenShare();
      // await this.livekitService.participantScreenShare();
    } catch (error) {
      console.error('Error toggling sharescreen:', error);
      // Handle error (e.g., show an error message to the user)
    }
  }

  async toggleVideo() {
    try {
      await this.livekitService.toggleVideo();
      const localParticipant = this.livekitService.room.localParticipant;
      this.isVideoOn = localParticipant.isCameraEnabled;
      this.stream = await this.livekitService.startCamera();
    } catch (error) {
      console.error('Error toggling video:', error);
    }
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
