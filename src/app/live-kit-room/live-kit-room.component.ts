import { Component, Input, OnInit } from '@angular/core';
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
  attachedTrack: HTMLElement | null = null;

  sharedLayout!: boolean;
  withVideo!: boolean;
  isScreenSharingEnabled: boolean = false;
  // participants = [
  //   {
  //     name: 'GJ',
  //     dp: 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-22049.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'George John',
  //   },
  //   {
  //     name: 'GJ',
  //     title: 'John Doe',
  //   },
  //   {
  //     name: 'GJ',
  //     dp: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'Henry Peel',
  //   },
  //   {
  //     name: 'GJ',
  //     title: 'New one',
  //   },
  //   {
  //     name: 'GJ',
  //     dp: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'Henry Peel',
  //   },
  //   {
  //     name: 'GJ',
  //     dp: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'New one',
  //   },
  //   {
  //     name: 'GJ',
  //     title: 'Henry Peel',
  //   },
  // ];
  // images = [
  //   {
  //     src: 'https://img.freepik.com/free-photo/beautiful-shot-tree-savanna-plains-with-blue-sky_181624-22049.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'George John',
  //   },
  //   {
  //     src: 'https://img.freepik.com/free-photo/beautiful-shot-snowy-mountains-with-dark-blue-sky_181624-2640.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'John Doe',
  //   },
  //   {
  //     src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'Henry Peel',
  //   },
  //   {
  //     src: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'New one',
  //   },
  //   {
  //     src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'Henry Peel',
  //   },
  //   {
  //     src: 'https://img.freepik.com/premium-photo/beautiful-tropical-beach-island_213396-4088.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'New one',
  //   },
  //   {
  //     src: 'https://img.freepik.com/premium-photo/landscape-africa-with-river-trees-mountains-horizon-cloudy-sky-3d-illustration_76964-3101.jpg?size=626&ext=jpg&ga=GA1.1.490661761.1705061609&semt=sph',
  //     title: 'Henry Peel',
  //   },
  // ];

  roomDetails: { wsURL: string; token: string } | null = null;
  nameForm!: FormGroup;
  isMeetingStarted = false;
  stream: MediaStream | undefined;
  participantName: string = '';
  screenShareTrackSubscription!: Subscription;
  screenShareTrack!: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private livekitService: LiveKitService
  ) {
    this.nameForm = this.formBuilder.group({
      name: [''],
    });
  }

  ngOnInit() {
    this.attachedTrack = this.livekitService.attachTrackToElement(
      Track,
      'remoteVideoContainer'
    );
    // this.screenShareTrackSubscription =
    //   this.livekitService.screenShareTrackSubscribed.subscribe(
    //     (track: RemoteTrack) => {
    //       this.screenShareTrack = track.source === Track.Source.ScreenShare;
    //       console.log('check condition', this.screenShareTrack);
    //       // Now you can use this.screenShareTrack to display the screen share track in your component's template
    //     }
    //   );
    this.livekitService.participantDisconnected.subscribe(
      (participantName: string) => {
        console.log('Participant disconnected:', participantName);
        this.participantName = participantName;
        setTimeout(() => {
          this.participantName = ''; // Clear the participant name after 2 or 3 seconds
        }, 2000); // Change to 3000 for 3 seconds
      }
    );
  }

  ngAfterViewInit(): void {
    this.screenShareTrackSubscription =
      this.livekitService.screenShareTrackSubscribed.subscribe(
        (track: RemoteTrack) => {
          this.screenShareTrack = track.source === Track.Source.ScreenShare;
          console.log('check condition', this.screenShareTrack);
          // Now you can use this.screenShareTrack to display the screen share track in your component's template
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
    // this.livekitService.remoteVideoTrackSubscribed.subscribe((track) => {
    //   // this.displayRemoteVideo(track);
    //   console.log('Received remote video track:', track);
    // });
    // this.livekitService.remoteAudioTrackSubscribed.subscribe((track) => {
    //   // Handle remote audio track
    //   console.log('Received remote audio track:', track);

    //   // this.displayRemoteAudio(track);
    //   // You can implement further logic here, such as playing the audio track
    // });
  }

  ngOnDestroy(): void {
    this.screenShareTrackSubscription.unsubscribe();
  }

  async startMeeting() {
    const name = this.nameForm.value.name;
    console.log('Entered name:', name);
    const wsURL = 'wss://vc-ua59wquz.livekit.cloud';
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ik5ldyIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZX0sImlhdCI6MTcxNTM0Njg0MiwibmJmIjoxNzE1MzQ2ODQyLCJleHAiOjE3MTUzNjg0NDIsImlzcyI6IkFQSVVXYkVLN0JndjR1ayIsInN1YiI6IldhcmRhIiwianRpIjoiV2FyZGEifQ.QM5SoDGbSDSAlM2szSuhGgmgP_VjVW3HQY_vmc5EC-k';
    try {
      this.isMeetingStarted = true;
      await this.livekitService.connectToRoom(wsURL, token);
      await this.livekitService.enableCameraAndMicrophone();
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
  // async toggleScreenShare() {
  //   this.isScreenSharing = !this.isScreenSharing;
  //   if (this.isScreenSharing) {
  //     this.iconColor = 'green';
  //   } else {
  //     this.iconColor = 'black';
  //   }
  //   try {
  //     await this.livekitService.toggleScreenShare();
  //     // await this.livekitService.participantScreenShare();
  //   } catch (error) {
  //     console.error('Error toggling sharescreen:', error);
  //     // Handle error (e.g., show an error message to the user)
  //   }
  // }
  async toggleScreenShare() {
    try {
      // Toggle the screen sharing state
      this.isScreenSharingEnabled = !this.isScreenSharingEnabled;

      // Update the icon color based on the screen sharing state
      this.iconColor = this.isScreenSharingEnabled ? 'green' : 'black';

      // Toggle screen sharing using the LiveKit service
      await this.livekitService.toggleScreenShare();
      if (this.livekitService.remoteParticipantSharingScreen === true) {
        this.isScreenSharingEnabled = false;
        this.isScreenSharing = false;
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
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
  get GalleryGridColumnStyle() {
    if (this.livekitService.room.numParticipants <= 6) {
      return GRIDCOLUMN[this.livekitService.room.numParticipants];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
}
