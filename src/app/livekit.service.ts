import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DataPacket_Kind,
  LocalParticipant,
  LocalTrack,
  LocalTrackPublication,
  MediaDeviceFailure,
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
  VideoQuality,
  setLogLevel,
} from 'livekit-client';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class LiveKitService {
  room!: Room;
  remoteVideoTrackSubscribed = new EventEmitter<RemoteTrack>();
  remoteParticipantName: string = '';
  remoteAudioTrackSubscribed = new EventEmitter();
  private isScreenSharingEnabled = false;
  private screenSharingInProgress = false;
  private isOtherParticipantSharing = false;
  videoStatusChanged = new EventEmitter<boolean>();
  remoteParticipantSharingScreen!: boolean;
  participants!: number;
  screenShareTrackSubscribed = new EventEmitter<any>();
  remoteScreenShare = false;
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  participantNamesUpdated = new EventEmitter<string[]>();
  localParticipantData = new EventEmitter<any>();
  private participantNames: any;
  private loacalParticipant: any;

  msgDataReceived = new EventEmitter<{
    message: any;
    participant: RemoteParticipant | undefined;
  }>();
  messageEmitter = new EventEmitter<any>();
  messages: { sender: string; text: string; timestamp: Date }[] = [];
  constructor(private snackBar: MatSnackBar) {}

  async connectToRoom(wsURL: string, token: string): Promise<void> {
    this.room = new Room();
    await this.room.connect(wsURL, token);
    console.log('Connected to room', this.room);
    this.audioVideoHandler();
    this.updateParticipantNames();
  }
  getLocalParticipant() {
    return this.room.localParticipant;
  }
  private updateParticipantNames() {
    this.participantNames = Array.from(this.room.remoteParticipants.values());
    this.participantNamesUpdated.emit(this.participantNames);

    this.loacalParticipant = this.room.localParticipant;
    this.localParticipantData.emit(this.loacalParticipant);

    console.log('participants remote', this.participantNames);
  }

  disconnectRoom() {
    if (this.room) {
      this.room.disconnect();
    }
  }
  async sendChatMessage(message: any) {
    try {
      // Encode message
      const strData = JSON.stringify({
        id: crypto.randomUUID(),
        ...message.msg,
        timestamp: Date.now(),
      });
      const data = new TextEncoder().encode(strData);
      const dataObj = JSON.parse(strData);
      await this.room.localParticipant.publishData(data, { reliable: true });
      this.messageEmitter.emit(dataObj);
      // console.log('Message sent successfully:', dataObj);
    } catch (error: any) {
      // console.error('Error sending message:', error);
      this.openSnackBar(`Send message Failed. ${error}`);
    }
  }

  audioVideoHandler() {
    this.participants = this.room.numParticipants;
    console.log('prrr now', this.participants);
    // this.room.on(RoomEvent.MediaDevicesError, (error: Error) => {
    //   console.log('screen share', MediaDeviceFailure.getFailure(error));
    //   this.openSnackBar(`Screen Share Failed: ${error.message}`);
    // });
    this.room.on(
      RoomEvent.DataReceived,
      (
        payload: Uint8Array,
        participant: RemoteParticipant | undefined,
        kind: DataPacket_Kind | undefined
      ) => {
        const strData = this.decoder.decode(payload);
        const message = JSON.parse(strData);
        console.log('mesg', JSON.parse(strData));
        console.log('participant', participant);
        this.msgDataReceived.emit({ message, participant });
      }
    );
    this.room.on(RoomEvent.TrackMuted, this.handleTrackMuted.bind(this));
    this.room.on(RoomEvent.TrackUnmuted, this.handleTrackUnmuted.bind(this));

    this.room.on(
      RoomEvent.TrackSubscribed,
      this.handleTrackSubscribed.bind(this)
    );
    this.room.on(
      RoomEvent.ParticipantDisconnected,
      this.handleParticipantDisconnected.bind(this)
    );

    // also subscribe to tracks published before participant joined
    this.room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        publication.setSubscribed(true);
      });
    });

    this.room.on(RoomEvent.TrackPublished, (publication, participant) => {
      publication.setSubscribed(true);
    });
    this.room.on(
      RoomEvent.LocalTrackUnpublished,
      (publication: LocalTrackPublication, participant: LocalParticipant) => {
        if (publication.source === Track.Source.ScreenShare) {
          this.remoteScreenShare = false;
        }
      }
    );
    this.room.on(
      RoomEvent.LocalTrackPublished,
      (publication: LocalTrackPublication, participant: LocalParticipant) => {
        if (publication.track?.source === Track.Source.Camera) {
          const el2 = document.createElement('div');
          el2.setAttribute('class', 'lk-participant-tile');
          el2.setAttribute('id', `${participant.sid}`);
          el2.setAttribute(
            'style',
            `        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        border-radius: 0.5rem;
        width:100%`
          );
          const container = document.querySelector('.lk-grid-layout');
          if (container) {
            // el2.appendChild(container);
            const element = publication.track.attach();
            el2.appendChild(element);
            element.setAttribute(
              'style',
              'border-radius: 0.5rem; width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;'
            );
            const el3 = document.createElement('div');
            el3.setAttribute('class', 'lk-participant-metadata');
            el3.setAttribute(
              'style',
              `position: absolute;
              right: 0.25rem;
              bottom: 0.25rem;
              left: 0.25rem;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              gap: 0.5rem;
              line-height: 1;`
            );
            const el4 = document.createElement('div');
            el4.setAttribute('class', 'lk-participant-metadata-item');
            el4.setAttribute(
              'style',
              `display: flex;
              align-items: center;
              padding: 0.25rem;
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: calc(var(--lk-border-radius) / 2);`
            );
            const el5 = document.createElement('span');
            el5.setAttribute('class', 'lk-participant-name');
            el5.setAttribute(
              'style',
              ` font-size: 0.875rem;
              color: white;
              `
            );
            el2.appendChild(el3);
            el3.appendChild(el4);
            el4.appendChild(el5);
            el5.innerText = participant.identity;
            container.appendChild(el2);
            // container.appendChild(el3);
            console.log('local track published', publication.track);

            //   <div class="lk-participant-metadata">
            //   <div class="lk-participant-metadata-item">
            //     <span class="lk-participant-name">Hassam Qayyum</span>
            //   </div>
            // </div>
          } else {
            console.error('Remote video container not found');
            this.openSnackBar(`Video could not open. Try again later`);
          }
        }
        this.screenShareTrackSubscribed.emit(publication.track);
        if (publication.source === Track.Source.ScreenShare) {
          this.remoteScreenShare = true;
          setTimeout(() => {
            const el2 = document.createElement('div');
            el2.setAttribute('class', 'lk-participant-tile');
            el2.setAttribute(
              'style',
              ` --lk-speaking-indicator-width: 2.5px;
            position: relative;
            display: flex;
            flex-direction: column;
            height:100%;
            gap: 0.375rem;
            overflow: hidden;
            border-radius: 0.5rem;`
            );
            const screenShareTrack = publication.track?.attach();
            if (screenShareTrack) {
              const container = document.querySelector('.lk-focus-layout');
              console.log('screenshare container', container);
              // el2.appendChild(container);

              screenShareTrack.setAttribute(
                'style',
                'width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;  object-fit: contain;background-color: #1e1e1e;'
              );
              const el3 = document.createElement('div');
              el3.setAttribute('class', 'lk-participant-metadata');
              el3.setAttribute(
                'style',
                `position: absolute;
              right: 0.25rem;
              bottom: 0.25rem;
              left: 0.25rem;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              gap: 0.5rem;
              line-height: 1;`
              );
              const el4 = document.createElement('div');
              el4.setAttribute('class', 'lk-participant-metadata-item');
              el4.setAttribute(
                'style',
                `display: flex;
              align-items: center;
              padding: 0.25rem;
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: 0.25rem;`
              );
              const el5 = document.createElement('span');
              el5.setAttribute('class', 'lk-participant-name');
              el5.setAttribute(
                'style',
                ` font-size: 0.875rem;
              color: white;
              `
              );
              el2.appendChild(screenShareTrack);
              el2.appendChild(el3);
              el3.appendChild(el4);
              el4.appendChild(el5);
              el5.innerText = participant.identity;
              container?.appendChild(el2);
            } else {
              console.error('Remote screen share container not found');
              this.openSnackBar(`Screen Share not Enabled. Try again later`);
            }
          }, 100);
        }
      }
    );

    this.room.remoteParticipants.forEach((participant) => {
      participant.trackPublications.forEach((publication) => {
        if (publication.track && publication.kind === 'video') {
          this.handleTrackSubscribed(
            publication.track,
            publication,
            participant
          );
        }
      });
    });
  }

  handleParticipantDisconnected(participant: RemoteParticipant) {
    console.log('Participant disconnected:', participant);
    this.openSnackBar(
      `Participant "${participant.identity}" has disconnected.`
    );
    const container = document.querySelector('.lk-grid-layout');
    if (container) {
      const participantTiles = container.querySelectorAll(
        '.lk-participant-tile'
      );
      participantTiles.forEach((tile) => {
        const nameElement = tile.querySelector('.lk-participant-name');
        if (nameElement && nameElement.textContent === participant.identity) {
          tile.remove();
        }
      });
    }
  }

  attachTrackToElement(track: any, elementId: string): HTMLElement | null {
    if (track.kind === 'video' && track.source === Track.Source.Camera) {
      const container = document.getElementById(elementId);
      if (container) {
        return track.attach();
      } else {
        console.error('Remote video container not found');
      }
    }
    return null;
  }
  handleTrackUnmuted(publication: TrackPublication, participant: Participant) {
    console.log('Track :', publication);
    console.log('testing', publication.kind);
    if (
      publication.kind === 'video' &&
      publication.track?.source === Track.Source.Camera
    ) {
      console.log('video is on');
      const containerById = document.getElementById(`${participant.sid}`);
      const imgElement = containerById?.getElementsByTagName('img');
      imgElement![0]?.remove();
    }
  }

  handleTrackMuted(publication: TrackPublication, participant: Participant) {
    console.log('Track mute/unmute event:', publication, participant);
    if (
      publication.kind === 'video' &&
      publication.track?.source === Track.Source.Camera
    ) {
      // Check if the track is muted
      if (publication.isMuted) {
        // Handle logic for when video is muted
        console.log('Video is off');
        // const container = document.querySelector('.lk-participant-tile');
        const containerById = document.getElementById(`${participant.sid}`);
        const imgElement = document.createElement('img');
        imgElement.setAttribute('src', '../assets/avatar.png');
        imgElement.setAttribute(
          'style',
          'position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60px; height: 60px; border-radius: 50%; object-fit: cover; object-position: center;'
        );
        containerById?.appendChild(imgElement);
      } else {
        // Handle logic for when video is unmuted
        console.log('Video is on');
      }
    }
  }

  handleTrackSubscribed(
    track: RemoteTrack,

    publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) {
    console.log('testing', publication);
    if (track.kind === 'video' && track.source === Track.Source.Camera) {
      // const container = document.getElementById('remoteVideoContainer');
      // if (container) {
      //   const element = track.attach();
      //   element.setAttribute('class', 'lk-participant-tile');
      //   element.setAttribute(
      //     'style',
      //     'position: relative;  display: flex ;flex-direction: column ;gap: 0.375rem ; overflow: hidden ;border-radius: 0.5rem '
      //   );
      //   container.appendChild(element);
      // } else {
      //   console.error('Remote video container not found');
      // }
      // ===================================
      const el2 = document.createElement('div');
      el2.setAttribute('class', 'lk-participant-tile');
      el2.setAttribute('id', `${participant.sid}`);
      el2.setAttribute(
        'style',
        `position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.375rem;
        border-radius: 0.5rem;
        width:100%`
      );
      const container = document.querySelector('.lk-grid-layout');
      if (container) {
        const element = track.attach();
        el2.appendChild(element);
        element.setAttribute(
          'style',
          'border-radius: 0.5rem;width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;'
        );
        const el3 = document.createElement('div');
        el3.setAttribute('class', 'lk-participant-metadata');
        el3.setAttribute(
          'style',
          `position: absolute;
              right: 0.25rem;
              bottom: 0.25rem;
              left: 0.25rem;
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              gap: 0.5rem;
              line-height: 1;`
        );
        const el4 = document.createElement('div');
        el4.setAttribute('class', 'lk-participant-metadata-item');
        el4.setAttribute(
          'style',
          `display: flex;
              align-items: center;
              padding: 0.25rem;
              background-color: rgba(0, 0, 0, 0.5);
              border-radius: calc(var(--lk-border-radius) / 2);`
        );
        const el5 = document.createElement('span');
        el5.setAttribute('class', 'lk-participant-name');
        el5.setAttribute(
          'style',
          ` font-size: 0.875rem;
              color: white;
              `
        );
        el2.appendChild(el3);
        el3.appendChild(el4);
        el4.appendChild(el5);
        el5.innerText = participant.identity;
        container.appendChild(el2);
        // container.appendChild(el3);
        publication.setVideoQuality(VideoQuality.LOW);
        this.remoteParticipantName = participant.identity; // Associate video element with participant
        if (element) {
          this.openSnackBar(
            `Participant "${participant.identity}" has joined.`
          );
        }
      } else {
        console.error('Remote video container not found');
      }
    }
    if (track.kind === 'audio') {
      const container = document.getElementById('remoteAudioContainer');
      if (container) {
        const element = track.attach();
        container.appendChild(element);
      } else {
        console.error('Remote audio container not found');
      }
    }
    this.screenShareTrackSubscribed.emit(track);
    if (track.source === Track.Source.ScreenShare && track.kind === 'video') {
      this.remoteScreenShare = true;
      setTimeout(() => {
        const el2 = document.createElement('div');
        el2.setAttribute('class', 'lk-participant-tile');
        el2.setAttribute(
          'style',
          ` --lk-speaking-indicator-width: 2.5px;
        position: relative;
        display: flex;
        flex-direction: column;
        height:100%;
        gap: 0.375rem;
        overflow: hidden;
        border-radius: 0.5rem;`
        );
        const screenShareTrack = publication.track?.attach();
        if (screenShareTrack) {
          const container = document.querySelector('.lk-focus-layout');
          console.log('screenshare container', container);
          // el2.appendChild(container);

          screenShareTrack.setAttribute(
            'style',
            'width: 100%; height: 100%; object-fit: cover; object-position: center; background-color: #000; object-fit: cover;  object-fit: contain;background-color: #1e1e1e;'
          );
          const el3 = document.createElement('div');
          el3.setAttribute('class', 'lk-participant-metadata');
          el3.setAttribute(
            'style',
            `position: absolute;
          right: 0.25rem;
          bottom: 0.25rem;
          left: 0.25rem;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          line-height: 1;`
          );
          const el4 = document.createElement('div');
          el4.setAttribute('class', 'lk-participant-metadata-item');
          el4.setAttribute(
            'style',
            `display: flex;
          align-items: center;
          padding: 0.25rem;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 0.25rem;`
          );
          const el5 = document.createElement('span');
          el5.setAttribute('class', 'lk-participant-name');
          el5.setAttribute(
            'style',
            ` font-size: 0.875rem;
          color: white;
          `
          );
          el2.appendChild(screenShareTrack);
          el2.appendChild(el3);
          el3.appendChild(el4);
          el4.appendChild(el5);
          el5.innerText = participant.identity;
          container?.appendChild(el2);
        } else {
          console.error('Remote screen share container not found');
        }
      }, 100);
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
    this.videoStatusChanged.emit(!isVideoEnabled); // Emit the updated video status
  }

  async startCamera(): Promise<MediaStream | undefined> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      return stream;
    } catch (error) {
      console.error('Error accessing the camera:', error);
      this.openSnackBar(`Error accessing the camera, ${error}`);
      return undefined;
    }
  }

  async toggleScreenShare(): Promise<void> {
    if (this.isScreenSharingEnabled === true) {
      await this.room.localParticipant.setScreenShareEnabled(false);
      this.isScreenSharingEnabled = false;
      const container = document.querySelector('.lk-focus-layout');
      if (container) {
        container.remove();
      } else {
        console.error('Local screen share container not found');
      }
    } else {
      this.remoteParticipantSharingScreen = false;
      this.room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (
            publication.track &&
            publication.track.source === Track.Source.ScreenShare
          ) {
            // await this.room.localParticipant.setScreenShareEnabled(true);
            // this.isScreenSharingEnabled = true;
            this.remoteParticipantSharingScreen = true;
          }
        });
      });
      // Check if any remote participant is already sharing screen
      // let remoteParticipantSharingScreen = false;
      this.room.remoteParticipants.forEach((participant) => {
        participant.trackPublications.forEach((publication) => {
          if (
            publication.track &&
            publication.track.source === Track.Source.ScreenShare
          ) {
            this.remoteParticipantSharingScreen = true;
          }
        });
      });

      if (this.remoteParticipantSharingScreen) {
        // console.log('Another participant is already sharing their screen.');
        const modal = document.getElementById('myModal') as HTMLElement;
        const closeBtn = modal?.querySelector('.close') as HTMLElement;

        modal?.setAttribute('style', 'display:block');

        closeBtn.onclick = function () {
          modal?.setAttribute('style', 'display:none');
        };

        window.onclick = function (event) {
          if (event.target == modal) {
            modal?.setAttribute('style', 'display:none');
          }
        };
      } else {
        // No participant is sharing screen, proceed to start screen sharing
        await this.room.localParticipant.setScreenShareEnabled(true);
        this.isScreenSharingEnabled = true;
      }
    }
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // duration in milliseconds
    });
  }
}
