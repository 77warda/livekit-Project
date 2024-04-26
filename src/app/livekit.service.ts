import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  LocalParticipant,
  LocalTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from 'livekit-client';

@Injectable({
  providedIn: 'root',
})
export class LiveKitService {
  private room!: Room;
  remoteVideoTrackSubscribed = new EventEmitter<RemoteTrack>();
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
  }

  private handleTrackSubscribed(
    track: RemoteTrack,
    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log('Audio/video track:', track);
    console.log('Publication:', publication);
    console.log('Participant:', participant);

    if (track.kind === 'video') {
      this.remoteVideoTrackSubscribed.emit(track);
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
  // async stopCamera(): Promise<MediaStream | undefined> {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: false,
  //     });
  //     return stream;
  //   } catch (error) {
  //     console.error('Error accessing the camera:', error);
  //     return undefined;
  //   }
  // }
}
