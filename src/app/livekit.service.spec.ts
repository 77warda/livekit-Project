import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LiveKitService } from './livekit.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {
  LocalParticipant,
  Participant,
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
} from 'livekit-client';
import { EventEmitter } from '@angular/core';

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
  describe('attach track to element', () => {
    it('should attach video track to element and return the attached element', () => {
      const track = {
        kind: 'video',
        source: Track.Source.Camera,
        attach: jasmine
          .createSpy('attach')
          .and.returnValue(document.createElement('video')),
      } as any;

      const container = document.createElement('div');
      container.id = 'videoContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'videoContainer'
      );

      expect(track.attach).toHaveBeenCalled();
      expect(attachedElement).toBeInstanceOf(HTMLElement);

      document.body.removeChild(container);
    });

    it('should not attach track if elementId is not found', () => {
      const track = {
        kind: 'video',
        source: Track.Source.Camera,
        attach: jasmine.createSpy('attach'),
      } as any;

      spyOn(console, 'error');

      const attachedElement = service.attachTrackToElement(
        track,
        'nonExistentContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Remote video container not found'
      );
      expect(attachedElement).toBeNull();
    });

    it('should not attach track if track kind is not video', () => {
      const track = {
        kind: 'audio',
        source: Track.Source.Microphone,
        attach: jasmine.createSpy('attach'),
      } as any;

      const container = document.createElement('div');
      container.id = 'audioContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'audioContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(attachedElement).toBeNull();

      document.body.removeChild(container);
    });

    it('should not attach track if track source is not camera', () => {
      const track = {
        kind: 'video',
        source: Track.Source.ScreenShare,
        attach: jasmine.createSpy('attach'),
      } as any;

      const container = document.createElement('div');
      container.id = 'screenShareContainer';
      document.body.appendChild(container);

      const attachedElement = service.attachTrackToElement(
        track,
        'screenShareContainer'
      );

      expect(track.attach).not.toHaveBeenCalled();
      expect(attachedElement).toBeNull();

      document.body.removeChild(container);
    });
  });
  describe('handle participant disconnected', () => {
    beforeEach(() => {
      spyOn(service, 'openSnackBar').and.stub();
      spyOn(service, 'updateParticipantNames').and.stub();
    });
    it('should handle participant disconnection, show snackbar, and update participant names', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      // Create mock DOM structure
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');

      const participantTile = document.createElement('div');
      participantTile.classList.add('lk-participant-tile');

      const nameElement = document.createElement('div');
      nameElement.classList.add('lk-participant-name');
      nameElement.textContent = 'participant1';

      participantTile.appendChild(nameElement);
      container.appendChild(participantTile);
      document.body.appendChild(container);

      spyOn(console, 'log');

      // Call the method
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that the participant tile was removed
      const remainingTiles = container.querySelectorAll('.lk-participant-tile');
      expect(remainingTiles.length).toBe(0);

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();

      // Clean up
      document.body.removeChild(container);
    });

    it('should handle participant disconnection without container', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      spyOn(console, 'log');

      // Call the method without adding the container to the DOM
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();
    });

    it('should handle participant disconnection without matching participant tiles', () => {
      const participant: RemoteParticipant = {
        identity: 'participant1',
      } as RemoteParticipant;

      // Create mock DOM structure
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');

      const participantTile = document.createElement('div');
      participantTile.classList.add('lk-participant-tile');

      const nameElement = document.createElement('div');
      nameElement.classList.add('lk-participant-name');
      nameElement.textContent = 'participant2';

      participantTile.appendChild(nameElement);
      container.appendChild(participantTile);
      document.body.appendChild(container);

      spyOn(console, 'log');

      // Call the method
      service.handleParticipantDisconnected(participant);

      // Check that the snackbar was shown
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "participant1" has disconnected.'
      );

      // Check that the participant tile was not removed
      const remainingTiles = container.querySelectorAll('.lk-participant-tile');
      expect(remainingTiles.length).toBe(1);

      // Check that updateParticipantNames was called
      expect(service.updateParticipantNames).toHaveBeenCalled();

      // Clean up
      document.body.removeChild(container);
    });
  });
  describe('get local participant', () => {
    it('should return the local participant from the room', () => {
      const localParticipant: LocalParticipant = {} as LocalParticipant;
      const room: Room = {
        localParticipant,
      } as Room;

      // Mock the room in the service
      service['room'] = room;

      const result = service.getLocalParticipant();

      expect(result).toBe(localParticipant);
    });

    it('should return undefined if room is not set', () => {
      // Ensure room is not set
      service['room'] = undefined as any;

      const result = service.getLocalParticipant();

      expect(result).toBeUndefined();
    });
  });
  describe('send chat message', () => {
    it('should send a chat message with the correct data and recipient', async () => {
      const mockRoom = {
        localParticipant: {
          publishData: (data: any, options: any) => {},
        },
      };
      const mockMessageEmitter = spyOn(service.messageEmitter, 'emit');

      service.room = mockRoom as any;

      // service['messageEmitter'] = mockMessageEmitter;
      const publishDataSpy = spyOn(
        service.room.localParticipant,
        'publishData'
      );
      const message = {
        msg: 'Hello, world!',
        recipient: 'user-123',
      };

      spyOn(crypto, 'randomUUID').and.returnValue(
        'mock-uuid' as `${string}-${string}-${string}-${string}-${string}`
      ); // Fix here

      const expectedDataObj = {
        id: 'mock-uuid',
        message: message.msg,
        recipient: message.recipient,
        timestamp: jasmine.any(Number),
      };

      await service.sendChatMessage(message);

      expect(publishDataSpy).toHaveBeenCalledTimes(1);
      expect(publishDataSpy).toHaveBeenCalledWith(jasmine.any(Uint8Array), {
        reliable: true,
        destinationIdentities: [message.recipient],
      });

      expect(mockMessageEmitter).toHaveBeenCalledTimes(1);
    });

    it('should handle error when sending chat message fails', async () => {
      const mockRoom = {
        localParticipant: {
          publishData: (data: any, options: any) => {},
        },
      };
      const mockMessageEmitter = spyOn(service.messageEmitter, 'emit');

      service.room = mockRoom as any;
      const publishDataSpy = spyOn(
        service.room.localParticipant,
        'publishData'
      );
      const message = {
        msg: 'Hello, world!',
        recipient: 'user-123',
      };
      const mockError = new Error('Publish failed');

      spyOn(crypto, 'randomUUID').and.returnValue(
        'mock-uuid' as `${string}-${string}-${string}-${string}-${string}`
      ); // Fix here

      publishDataSpy.and.throwError(mockError);

      await service.sendChatMessage(message);

      expect(publishDataSpy).toHaveBeenCalled();
      expect(mockMessageEmitter).not.toHaveBeenCalled();
    });
  });
  describe('Disconnect room', () => {
    it('should call disconnect on the room if room is set', () => {
      const room = jasmine.createSpyObj('Room', ['disconnect']);
      // Mock the room in the service
      service['room'] = room as any;

      // Call the method
      service.disconnectRoom();

      // Check that disconnect was called
      expect(room.disconnect).toHaveBeenCalled();
    });

    it('should not call disconnect if room is not set', () => {
      const room = jasmine.createSpyObj('Room', ['disconnect']);
      // Ensure room is not set
      service['room'] = undefined as any;

      // Call the method
      service.disconnectRoom();

      // Check that disconnect was not called
      expect(room.disconnect).not.toHaveBeenCalled();
    });
  });
  describe('Audio video handler', () => {
    it('should attach track muted event handler to the room', () => {
      const mockRoom = jasmine.createSpyObj<Room>('Room', ['on']);
      service['room'] = mockRoom;
      // Verify that the event handler is attached to the Room's 'TrackMuted' event
      expect(mockRoom.on).toHaveBeenCalledWith(
        RoomEvent.TrackMuted,
        jasmine.any(Function)
      );
    });
  });
  // describe('Room event handlers', () => {

  // });
});
