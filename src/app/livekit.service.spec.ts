import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LiveKitService } from './livekit.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {
  LocalParticipant,
  Participant,
  Room,
  Track,
  TrackPublication,
} from 'livekit-client';

describe('LivekitService', () => {
  TestBed.configureTestingModule({
    providers: [LiveKitService],
  });
  let service: LiveKitService;
  let roomMock: jasmine.SpyObj<Room>;
  let localParticipantMock: jasmine.SpyObj<LocalParticipant>;
  let modal: HTMLElement;
  let closeBtn: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatDialogModule, NoopAnimationsModule],
      providers: [LiveKitService, { provide: Room, useValue: roomMock }],
    });
    service = TestBed.inject(LiveKitService);

    modal = document.createElement('div');
    modal.id = 'myModal';
    closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
  });

  afterEach(() => {
    // Clean up modal element after each test
    document.body.removeChild(modal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should throw an error if room is not enabled', fakeAsync(() => {
    service.room = null as unknown as Room; // Mock room as null for testing
    expectAsync(service.toggleVideo()).toBeRejectedWithError(
      'Room not Enabled.'
    );
  }));

  it('should toggle video from enabled to disabled', fakeAsync(() => {
    // Ensure the room is set correctly before calling the method
    service.room = {
      localParticipant: {
        isCameraEnabled: true,
        setCameraEnabled: (status: boolean) => status,
      },
    } as any;

    spyOn(service.videoStatusChanged, 'emit');

    service.toggleVideo();
    tick();

    expect(service.videoStatusChanged.emit).toHaveBeenCalledWith(false);
  }));
  it('should toggle microphone state and throw error if room is not enabled', async () => {
    // Mock room with local participant
    const localParticipantMock = jasmine.createSpyObj('LocalParticipant', [
      'isMicrophoneEnabled',
      'setMicrophoneEnabled',
    ]);
    localParticipantMock.isMicrophoneEnabled.and.returnValue(true);

    // Test with room enabled
    service.room = { localParticipant: localParticipantMock } as any;
    await service.toggleMicrophone();
    expect(localParticipantMock.setMicrophoneEnabled).toHaveBeenCalledWith(
      false
    );

    // Test error thrown for missing room
    service.room = null as any;
    await expectAsync(service.toggleMicrophone()).toBeRejectedWithError(
      'Room not Enabled.'
    );
  });
  it('should enable camera and microphone and throw error if room is not enabled', async () => {
    // Mock room with local participant (using createSpyObj with correct type)
    const localParticipantMock: jasmine.SpyObj<LocalParticipant> =
      jasmine.createSpyObj('LocalParticipant', ['enableCameraAndMicrophone']);

    // Test with room enabled
    service.room = { localParticipant: localParticipantMock } as any;
    await service.enableCameraAndMicrophone();
    expect(localParticipantMock.enableCameraAndMicrophone).toHaveBeenCalled();

    // Test error thrown for missing room
    service.room = null as any;
    await expectAsync(
      service.enableCameraAndMicrophone()
    ).toBeRejectedWithError('Room not Enabled.');
  });

  it('should have a startCamera function', () => {
    expect(service.startCamera).toBeInstanceOf(Function);
  });

  it('should return a MediaStream when getUserMedia is successful', async () => {
    const mediaStreamMock = new MediaStream();
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
      Promise.resolve(mediaStreamMock)
    );
    const result = await service.startCamera();
    expect(result).toBe(mediaStreamMock);
  });

  it('should show modal when remote participant is sharing screen', async () => {
    service.isScreenSharingEnabled = false;
    service.remoteParticipantSharingScreen = true;
    const modal = document.createElement('div');
    modal.id = 'myModal';
    document.body.appendChild(modal);
    await service.toggleScreenShare();
    expect(modal.style.display).toBe('block');
  });

  it('should disable screen sharing and remove container if enabled', async () => {
    service.isScreenSharingEnabled = true;
    const roomLocalParticipantMock = jasmine.createSpyObj('LocalParticipant', [
      'setScreenShareEnabled',
    ]);
    const containerMock = document.createElement('div');
    containerMock.classList.add('lk-focus-layout');
    document.body.appendChild(containerMock); // Simulate container in DOM

    service.room = { localParticipant: roomLocalParticipantMock } as any;
    await service.toggleScreenShare();

    expect(roomLocalParticipantMock.setScreenShareEnabled).toHaveBeenCalledWith(
      false
    );
    expect(service.isScreenSharingEnabled).toBeFalse();
    expect(document.body.contains(containerMock)).toBeFalse(); // Check if container is removed
  });
  // it('should display modal and set event handlers if remoteParticipantSharingScreen is true', () => {
  //   service['remoteParticipantSharingScreen'] = true;

  //   // Invoke the method or code block that contains the if condition
  //   if (service['remoteParticipantSharingScreen']) {
  //     const modal = document.getElementById('myModal') as HTMLElement;
  //     const closeBtn = modal?.querySelector('.close') as HTMLElement;

  //     modal?.setAttribute('style', 'display:block');

  //     closeBtn.onclick = function () {
  //       modal?.setAttribute('style', 'display:none');
  //     };

  //     window.onclick = function (event) {
  //       if (event.target == modal) {
  //         modal?.setAttribute('style', 'display:none');
  //       }
  //     };
  //   }

  //   // Check that the modal is displayed
  //   expect(modal.getAttribute('style')).toBe('display:block');

  //   // Simulate clicking the close button
  //   closeBtn.click();
  //   expect(modal.getAttribute('style')).toBe('display:none');

  //   // Simulate clicking outside the modal
  //   modal.setAttribute('style', 'display:block');
  //   const clickEvent = new MouseEvent('click');
  //   Object.defineProperty(clickEvent, 'target', {
  //     value: modal,
  //     configurable: true,
  //   });
  //   window.dispatchEvent(clickEvent);
  //   expect(modal.getAttribute('style')).toBe('display:none');
  // });
  it('should handle track unmuted and remove img element', () => {
    // Mock participant and publication
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    // Create mock container and img element
    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    // Spy on console.log to suppress output during testing
    spyOn(console, 'log');

    // Call the method
    service.handleTrackUnmuted(publication, participant);

    // Check that the img element was removed
    expect(container.getElementsByTagName('img').length).toBe(0);

    // Clean up
    document.body.removeChild(container);
  });

  it('should not remove img element if track kind is not video', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'audio',
      track: {
        source: Track.Source.Microphone,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackUnmuted(publication, participant);

    expect(container.getElementsByTagName('img').length).toBe(1);

    document.body.removeChild(container);
  });
  it('should not remove img element if track source is not Camera', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      track: {
        source: Track.Source.ScreenShare,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    const img = document.createElement('img');
    container.appendChild(img);
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackUnmuted(publication, participant);

    expect(container.getElementsByTagName('img').length).toBe(1);

    document.body.removeChild(container);
  });
  it('should handle video muted and add img element', () => {
    // Mock participant and publication
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: true,
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    // Create mock container
    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    // Spy on console.log to suppress output during testing
    spyOn(console, 'log');

    // Call the method
    service.handleTrackMuted(publication, participant);

    // Check that the img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeTruthy();
    expect(imgElement!.getAttribute('src')).toBe('../assets/avatar.png');

    // Clean up
    document.body.removeChild(container);
  });

  it('should handle video unmuted and not add img element', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: false,
      track: {
        source: Track.Source.Camera,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });
  it('should handle track kind not being video', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'audio',
      isMuted: true,
      track: {
        source: Track.Source.Microphone,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });

  it('should handle track source not being camera', () => {
    const participant: Participant = {
      sid: 'participant1',
    } as Participant;

    const publication: TrackPublication = {
      kind: 'video',
      isMuted: true,
      track: {
        source: Track.Source.ScreenShare,
      } as Track,
    } as TrackPublication;

    const container = document.createElement('div');
    container.id = 'participant1';
    document.body.appendChild(container);

    spyOn(console, 'log');

    service.handleTrackMuted(publication, participant);

    // Check that no img element was added
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeFalsy();

    document.body.removeChild(container);
  });
});
