import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  LocalParticipant,
  LocalTrack,
  LocalTrackPublication,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  VideoQuality,
} from 'livekit-client';

@Injectable({
  providedIn: 'root',
})
export class LiveKitService {
  room!: Room;
  remoteVideoTrackSubscribed = new EventEmitter<RemoteTrack>();
  remoteParticipantName: string = '';
  participantDisconnected = new EventEmitter<string>();
  remoteAudioTrackSubscribed = new EventEmitter();
  private isScreenSharingEnabled = false;
  constructor() {}

  async connectToRoom(wsURL: string, token: string): Promise<void> {
    this.room = new Room();
    await this.room.connect(wsURL, token);
    console.log('Connected to room', this.room.name);
    this.audioVideoHandler();
  }

  audioVideoHandler() {
    this.room.on(
      RoomEvent.TrackSubscribed,
      this.handleTrackSubscribed.bind(this)
    );
    this.room.on(
      RoomEvent.ParticipantDisconnected,
      this.handleParticipantDisconnected.bind(this)
    );
    this.room.on(RoomEvent.TrackPublished, (publication, participant) => {
      publication.setSubscribed(true);
    });

    // also subscribe to tracks published before participant joined
    this.room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        publication.setSubscribed(true);
      });
    });
    this.room.on(
      RoomEvent.LocalTrackPublished,
      (publication: LocalTrackPublication, participant: LocalParticipant) => {
        if (publication.source === Track.Source.ScreenShare) {
          const screenShareContainer = document.querySelector(
            '#localScreenShareContainer'
          );
          const screenShareTrack = publication.track?.attach();
          if (screenShareTrack) {
            screenShareContainer?.appendChild(screenShareTrack);
          }
        }
      }
    );
  }

  private handleParticipantDisconnected(participant: RemoteParticipant) {
    console.log('Participant disconnected:', participant);
    this.participantDisconnected.emit(participant.identity);
    // Remove video element associated with the disconnected participant
    this.removeVideoElement(participant);
  }

  private removeVideoElement(participant: RemoteParticipant) {
    const container = document.getElementById('remoteVideoContainer');
    if (container) {
      // Find and remove video element for the disconnected participant
      const videoElements = container.getElementsByTagName('video');
      for (let i = 0; i < videoElements.length; i++) {
        const video = videoElements[i];
        if (video.srcObject) {
          video.remove();
          break;
        }
      }
    }
  }

  handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log('Audio/video track:', track);
    console.log('Publication:', publication);
    console.log('Participant:', participant);

    if (track.kind === 'video') {
      const container = document.getElementById('remoteVideoContainer');
      if (container) {
        const element = track.attach();
        element.style.width = '400px'; // Set fixed width
        element.style.height = '300px';
        container.appendChild(element);
        element.classList.add('participant-video');
        this.remoteParticipantName = participant.identity; // Associate video element with participant
      } else {
        console.error('Remote video container not found');
      }
    } else if (track.kind === 'audio') {
      const container = document.getElementById('remoteAudioContainer');
      if (container) {
        const element = track.attach();
        container.appendChild(element);
      } else {
        console.error('Remote audio container not found');
      }
    }
  }

  async enableCameraAndMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not Enabled.');
    }
    await this.room.localParticipant.enableCameraAndMicrophone();
  }
  async toggleMicrophone(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not Enabled.');
    }
    const localParticipant = this.room.localParticipant;
    const isMuted = localParticipant.isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(!isMuted);
  }

  async toggleVideo(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not Enabled.');
    }
    const localParticipant = this.room.localParticipant;
    const isVideoEnabled = localParticipant.isCameraEnabled;
    await localParticipant.setCameraEnabled(!isVideoEnabled);
  }

  async startCamera(): Promise<MediaStream | undefined> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      return stream;
    } catch (error) {
      console.error('Error accessing the camera:', error);
      return undefined;
    }
  }

  async toggleScreenShare(): Promise<void> {
    if (this.isScreenSharingEnabled) {
      this.room.localParticipant.setScreenShareEnabled(false);
      this.isScreenSharingEnabled = false;
    } else {
      this.room.localParticipant.setScreenShareEnabled(true);
      this.isScreenSharingEnabled = true;
    }
  }
  // ===================
  // async participantScreenShare(): Promise<void> {
  //   if (!this.isScreenSharingEnabled) {
  //     try {
  //       const stream = await navigator.mediaDevices.getDisplayMedia({
  //         video: true,
  //       });
  //       const container = document.getElementById('localScreenShareContainer');
  //       if (container) {
  //         const videoElement = document.createElement('video');
  //         videoElement.srcObject = stream;
  //         videoElement.autoplay = true;
  //         container.appendChild(videoElement);
  //         this.isScreenSharingEnabled = true;
  //       } else {
  //         console.error('Local screen share container not found');
  //       }
  //     } catch (error) {
  //       console.error('Error starting screen sharing:', error);
  //       // Handle error (e.g., show an error message to the user)
  //     }
  //   } else {
  //     this.room.localParticipant.setScreenShareEnabled(true);
  //     this.isScreenSharingEnabled = true;
  //     const container = document.getElementById('localScreenShareContainer');
  //     if (container) {
  //       container.innerHTML = ''; // Remove the video element from the container
  //       this.isScreenSharingEnabled = false;
  //     } else {
  //       console.error('Local screen share container not found');
  //     }
  //   }
  // }
  // ==============================================
  // async toggleScreenShare(): Promise<void> {
  //   // Object.values(this.room.localParticipant.videoTrackPublications).forEach((videoTrack: LocalTrackPublication) => videoTrack.track?.mediaStream)

  //   try {
  //     if (!this.isScreenSharingEnabled) {
  //       const stream = await navigator.mediaDevices.getDisplayMedia({
  //         video: true,
  //       });
  //       const container = document.getElementById('localScreenShareContainer');
  //       if (container) {
  //         const videoElement = document.createElement('video');
  //         videoElement.srcObject = stream;
  //         videoElement.autoplay = true;
  //         container.appendChild(videoElement);
  //         this.isScreenSharingEnabled = true;

  //         // Publish the screen sharing stream to the room
  //         await this.room.localParticipant.publishTrack(
  //           stream.getVideoTracks()[0],
  //           { name: 'screen_share' }
  //         );
  //       } else {
  //         console.error('Local screen share container not found');
  //       }
  //     } else {
  //       // this.room.localParticipant.unpublishTrack('screen_share'); // Unpublish the screen sharing track
  //       this.isScreenSharingEnabled = false;
  //       const container = document.getElementById('localScreenShareContainer');
  //       if (container) {
  //         container.innerHTML = ''; // Remove the video element from the container
  //       } else {
  //         console.error('Local screen share container not found');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error toggling screen sharing:', error);
  //     // Handle error (e.g., show an error message to the user)
  //   }
  // }
}
