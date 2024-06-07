import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LiveKitService } from './livekit.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import {
  DataPacket_Kind,
  LocalParticipant,
  LocalTrackPublication,
  Participant,
  RemoteParticipant,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
  TrackPublication,
} from 'livekit-client';
import { EventEmitter } from '@angular/core';
import { identity } from 'rxjs';

describe('LivekitService', () => {
  TestBed.configureTestingModule({
    providers: [LiveKitService],
  });
  let service: LiveKitService;
  let roomMock: jasmine.SpyObj<Room>;
  let localParticipantMock: jasmine.SpyObj<LocalParticipant>;
  // let modal: HTMLElement;
  // let closeBtn: HTMLElement;
  let mockLocalParticipant: jasmine.SpyObj<any>;
  let mockRemoteParticipants: jasmine.SpyObj<any>;
  let participantConnectedEmitter: EventEmitter<void>;
  let mockKind: DataPacket_Kind | undefined;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatDialogModule, NoopAnimationsModule],
      providers: [
        LiveKitService,
        { provide: Room, useValue: roomMock },
        { provide: TextDecoder, useValue: mockKind },
      ],
    });

    // modal = document.createElement('div');
    // modal.id = 'myModal';
    // closeBtn = document.createElement('span');
    // closeBtn.className = 'close';
    // modal.appendChild(closeBtn);
    // document.body.appendChild(modal);
    mockLocalParticipant = {
      identity: 'localParticipant',
    };

    mockRemoteParticipants = [
      jasmine.createSpyObj('RemoteParticipant', ['identity'], {
        identity: 'remoteParticipant1',
      }),
    ];

    roomMock = jasmine.createSpyObj('Room', ['on', 'connect', 'emit'], {
      localParticipant: mockLocalParticipant,
      remoteParticipants: new Map(
        mockRemoteParticipants.map((p: any) => [p.identity, p])
      ),
      numParticipants: 2,
    });

    // Mock the `on` method to subscribe to the `participantConnectedEmitter`
    roomMock.on.and.callFake((event, callback) => {
      if (event === RoomEvent.ParticipantConnected) {
        participantConnectedEmitter.subscribe(callback);
      }
      return roomMock; // Ensure it returns the Room object
    });
    service = TestBed.inject(LiveKitService);
    service.room = roomMock;
  });

  afterEach(() => {
    // Clean up modal element after each test
    // document.body.removeChild(modal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('should lower and raise hand events', () => {
    it('should raise hand and publish the correct message', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      // Spy on the private publishHandRaiseLowerMessage method
      spyOn<any>(service, 'publishHandRaiseLowerMessage').and.callThrough();

      const participant = { identity: 'user-123', handRaised: false };

      await service.raiseHand(participant);

      expect(participant.handRaised).toBeTrue();
      expect(service['publishHandRaiseLowerMessage']).toHaveBeenCalledWith({
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: true,
      });
    });
    it('should lower hand and publish the correct message', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      // Spy on the private publishHandRaiseLowerMessage method
      spyOn<any>(service, 'publishHandRaiseLowerMessage').and.callThrough();

      const participant = { identity: 'user-123', handRaised: true };

      await service.lowerHand(participant);

      expect(participant.handRaised).toBeFalse();
      expect(service['publishHandRaiseLowerMessage']).toHaveBeenCalledWith({
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: false,
      });
    });
    it('should publish hand raise/lower message with the correct data', async () => {
      // Mock LocalParticipant and Room
      const mockLocalParticipant = jasmine.createSpyObj('LocalParticipant', [
        'publishData',
      ]);
      const mockRoom = jasmine.createSpyObj('Room', [], {
        localParticipant: mockLocalParticipant,
      });
      service['room'] = mockRoom;

      const message = {
        type: 'handRaise',
        participantId: 'user-123',
        handRaised: true,
      };
      const strData = JSON.stringify(message);
      const encodedData = new TextEncoder().encode(strData);

      await service['publishHandRaiseLowerMessage'](message);

      expect(mockLocalParticipant.publishData).toHaveBeenCalledWith(
        encodedData,
        { reliable: true }
      );
    });
  });
  describe('Test for handleTrackSubscribed function', () => {
    it('should handle track subscription and append video element correctly', () => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'video',
        source: Track.Source.Camera,
      });
      const mockPublication = jasmine.createSpyObj('RemoteTrackPublication', [
        'setVideoQuality',
      ]);
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Spy on the console methods to verify if they're called
      spyOn(console, 'log');
      spyOn(console, 'error');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.classList.add('lk-grid-layout');
      document.body.appendChild(container);

      // Mock the attach method to return a dummy element
      const mockElement = document.createElement('video');
      mockTrack.attach.and.returnValue(mockElement);

      // Spy on the openSnackBar method
      spyOn(service, 'openSnackBar');

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Assertions
      expect(console.log).toHaveBeenCalledWith('testing', mockPublication);
      expect(mockTrack.attach).toHaveBeenCalled();
      // expect(mockPublication.setVideoQuality).toHaveBeenCalledWith(VideoQuality.LOW);
      expect(service.openSnackBar).toHaveBeenCalledWith(
        'Participant "user-123" has joined.'
      );

      // Verify the video element is appended to the container
      const appendedElement = container.querySelector('.lk-participant-tile');
      expect(appendedElement).toBeTruthy();

      // Clean up the DOM
      document.body.removeChild(container);
    });
    it('should handle track subscription and append audio element correctly', () => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'audio',
        source: Track.Source.Microphone,
      });
      const mockPublication = jasmine.createSpyObj('RemoteTrackPublication', [
        'setVideoQuality',
      ]);
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Spy on the console methods to verify if they're called
      spyOn(console, 'log');
      spyOn(console, 'error');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.setAttribute('id', 'remoteAudioContainer');
      document.body.appendChild(container);

      // Mock the attach method to return a dummy element
      const mockElement = document.createElement('audio');
      mockTrack.attach.and.returnValue(mockElement);

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Assertions
      expect(console.log).toHaveBeenCalledWith('testing', mockPublication);
      expect(mockTrack.attach).toHaveBeenCalled();

      // Verify the audio element is appended to the container
      const appendedElement = container.querySelector('audio');
      expect(appendedElement).toBeTruthy();

      // Clean up the DOM
      document.body.removeChild(container);
    });

    it('should handle screen share track subscription and update the DOM', (done) => {
      // Mock track, publication, and participant
      const mockTrack = jasmine.createSpyObj('RemoteTrack', ['attach'], {
        kind: 'video',
        source: Track.Source.ScreenShare,
      });
      const mockPublication = jasmine.createSpyObj(
        'RemoteTrackPublication',
        [],
        { track: mockTrack }
      );
      const mockParticipant = jasmine.createSpyObj('RemoteParticipant', [], {
        sid: 'participant-123',
        identity: 'user-123',
      });

      // Mock the attach method to return a dummy video element
      const mockElement = document.createElement('video');
      mockTrack.attach.and.returnValue(mockElement);

      // Spy on the console methods to verify if they're called
      spyOn(console, 'log');
      spyOn(console, 'error');

      // Spy on the emit method of screenShareTrackSubscribed event emitter
      spyOn(service.screenShareTrackSubscribed, 'emit');

      // Create a container element in the DOM for testing
      const container = document.createElement('div');
      container.setAttribute('class', 'lk-focus-layout');
      document.body.appendChild(container);

      // Call the method under test
      service.handleTrackSubscribed(
        mockTrack,
        mockPublication,
        mockParticipant
      );

      // Check immediate effects
      expect(service.remoteScreenShare).toBeTrue();
      expect(service.screenShareTrackSubscribed.emit).toHaveBeenCalledWith(
        mockTrack
      );

      // Check the DOM manipulation after setTimeout
      setTimeout(() => {
        const appendedElement = container.querySelector('.lk-participant-tile');
        expect(appendedElement).not.toBeNull(
          'Expected .lk-participant-tile to be present in the DOM'
        );

        const videoElement = appendedElement!.querySelector('video');
        expect(videoElement).not.toBeNull(
          'Expected video element to be present inside .lk-participant-tile'
        );

        const participantNameElement = appendedElement!.querySelector(
          '.lk-participant-name'
        );
        expect(participantNameElement).not.toBeNull(
          'Expected .lk-participant-name to be present inside .lk-participant-tile'
        );
        expect(participantNameElement!.textContent).toBe(
          'user-123',
          'Expected participant name to match'
        );

        // Clean up the DOM
        document.body.removeChild(container);
        done();
      }, 150);
    });
  });

  describe('when the user joins a room', () => {
    it('should connect to room', async () => {
      const wsURL = 'ws://example.com';
      const token = 'token123';

      await service.connectToRoom(wsURL, token);

      expect(roomMock.connect).toHaveBeenCalledWith(wsURL, token);
    });
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
  describe('when the user enable camera and microphone', () => {
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
  });

  describe('start camera function', () => {
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

    it('should handle error when getUserMedia fails', async () => {
      const errorMock = new Error('Camera access denied');
      spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
        Promise.reject(errorMock)
      );
      spyOn(console, 'error');
      const openSnackBarSpy = spyOn(service, 'openSnackBar');

      const result = await service.startCamera();

      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        'Error accessing the camera:',
        errorMock
      );
      expect(openSnackBarSpy).toHaveBeenCalledWith(
        `Error accessing the camera, ${errorMock}`
      );
    });
  });

  describe('Toggle screen share track unit testing', () => {
    let modal: HTMLElement;
    let closeBtn: HTMLElement;

    beforeEach(() => {
      // Setup the modal and close button before each test
      modal = document.createElement('div');
      modal.id = 'myModal';
      closeBtn = document.createElement('span');
      closeBtn.className = 'close';
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
    });

    afterEach(() => {
      // Clean up the modal after each test
      document.body.removeChild(modal);
    });
    describe('Show modal when screen is already shared', () => {
      it('should show modal when remote participant is sharing screen', async () => {
        // Mock the Room and its participants
        const mockTrack = { source: Track.Source.ScreenShare } as Track;
        const trackPublicationMock = jasmine.createSpyObj(
          'RemoteTrackPublication',
          [],
          {
            track: mockTrack,
          }
        );
        const remoteParticipantMock = jasmine.createSpyObj(
          'RemoteParticipant',
          [],
          {
            trackPublications: [trackPublicationMock],
          }
        );

        const roomMock = jasmine.createSpyObj('Room', ['localParticipant'], {
          remoteParticipants: [remoteParticipantMock],
        });

        // Assign the mocked room to the service
        service.room = roomMock;

        // Create and append modal to the DOM
        const modal = document.createElement('div');
        modal.id = 'myModal';
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        // Verify initial state of modal
        expect(modal.style.display).toBe('');

        // Set initial state
        service.remoteParticipantSharingScreen = false;
        service.isScreenSharingEnabled = false;

        // Call the method to be tested
        await service.toggleScreenShare();

        // Verify the participant's track publication
        expect(remoteParticipantMock.trackPublications.length).toBe(1);
        expect(remoteParticipantMock.trackPublications[0].track.source).toBe(
          Track.Source.ScreenShare
        );
        // Clean up the DOM
        document.body.removeChild(modal);
      });
      it('should hide modal when remote participant is not sharing screen', async () => {
        // Mock the Room and its participants
        const mockTrack = { source: Track.Source.ScreenShare } as Track;
        const trackPublicationMock = jasmine.createSpyObj(
          'RemoteTrackPublication',
          [],
          {
            track: mockTrack,
          }
        );
        const remoteParticipantMock = jasmine.createSpyObj(
          'RemoteParticipant',
          [],
          {
            trackPublications: [trackPublicationMock],
          }
        );

        const roomMock = jasmine.createSpyObj('Room', ['localParticipant'], {
          remoteParticipants: [remoteParticipantMock],
        });

        // Assign the mocked room to the service
        service.room = roomMock;

        // Create and append modal to the DOM
        const modal = document.createElement('div');
        modal.id = 'myModal';
        modal.style.display = 'none'; // Ensure initial display is none
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        // Set initial state
        service.remoteParticipantSharingScreen = false;
        service.isScreenSharingEnabled = false;

        // Call the method to be tested
        await service.toggleScreenShare();

        // Debugging logs to inspect state
        console.log(
          'Modal display after toggleScreenShare:',
          modal.style.display
        );

        // Assert that the modal is displayed
        expect(modal.style.display).toBe('none');

        // Simulate the close button click
        closeBtn.click();

        // Debugging logs to inspect state
        console.log(
          'Modal display after close button click:',
          modal.style.display
        );

        // Assert that the modal is hidden
        expect(modal.style.display).toBe('none');

        // Clean up the DOM
        document.body.removeChild(modal);
      });
    });
    it('should disable screen sharing and remove container if enabled', async () => {
      service.isScreenSharingEnabled = true;
      const roomLocalParticipantMock = jasmine.createSpyObj(
        'LocalParticipant',
        ['setScreenShareEnabled']
      );
      const containerMock = document.createElement('div');
      containerMock.classList.add('lk-focus-layout');
      document.body.appendChild(containerMock); // Simulate container in DOM

      service.room = { localParticipant: roomLocalParticipantMock } as any;
      await service.toggleScreenShare();

      expect(
        roomLocalParticipantMock.setScreenShareEnabled
      ).toHaveBeenCalledWith(false);
      expect(service.isScreenSharingEnabled).toBeFalse();
      expect(document.body.contains(containerMock)).toBeFalse(); // Check if container is removed
    });
    it('should display modal and set event handlers if remoteParticipantSharingScreen is true', () => {
      service['remoteParticipantSharingScreen'] = true;

      // Invoke the method or code block that contains the if condition
      if (service['remoteParticipantSharingScreen']) {
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
      }

      // Check that the modal is displayed
      expect(modal.getAttribute('style')).toBe('display:block');

      // Simulate clicking the close button
      closeBtn.click();
      expect(modal.getAttribute('style')).toBe('display:none');

      // Simulate clicking outside the modal
      modal.setAttribute('style', 'display:block');
      const clickEvent = new MouseEvent('click');
      Object.defineProperty(clickEvent, 'target', {
        value: modal,
        configurable: true,
      });
      window.dispatchEvent(clickEvent);
      expect(modal.getAttribute('style')).toBe('display:none');
    });
  });

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
  describe('audioVideoHandler', () => {
    // it('should listen for DataReceived and TrackMuted events on room', function () {
    //   // spyOn(service.room, 'on');
    //   const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    //   service.audioVideoHandler();
    //   const publicationObj = {
    //     kind: 'audio',
    //     track: {
    //       source: 'camera',
    //     },
    //     isMuted: true,
    //   } as any;
    //   const participantObj = { sid: '1' } as any;
    //   service.room.emit(RoomEvent.TrackMuted, publicationObj, participantObj);
    //   expect(roomSpy).toHaveBeenCalledTimes(2);
    //   expect(roomSpy).toHaveBeenCalledWith(
    //     RoomEvent.DataReceived,
    //     jasmine.any(Function)
    //   );
    //   expect(roomSpy).toHaveBeenCalledWith(
    //     RoomEvent.TrackMuted,
    //     jasmine.any(Function)
    //   );
    // });

    describe('Testing for data received', () => {
      it('should handle DataReceived event and emit messages and hand raises', () => {
        // Spy on console.log
        service.audioVideoHandler();
        spyOn(console, 'log');
        // Spy on msgDataReceived and handRaised event emitters
        spyOn(service.msgDataReceived, 'emit');
        spyOn(service.handRaised, 'emit');
        // const mockKind: DataPacket_Kind | undefined = 'text';
        const mockPayload = new Uint8Array([
          123, 34, 116, 121, 112, 101, 34, 58, 34, 104, 97, 110, 100, 82, 97,
          105, 115, 101, 34, 44, 34, 104, 97, 110, 100, 82, 97, 105, 115, 101,
          100, 34, 58, 116, 114, 117, 101, 125,
        ]);
        const mockParticipant = {
          identity: 'Participant1',
        } as RemoteParticipant;
        // Emit the DataReceived event
        service.room.emit(
          RoomEvent.DataReceived,
          mockPayload,
          mockParticipant,
          mockKind
        );
        // const dataListener = mockRoom.on.calls.argsFor(0)[1];
        // dataListener(new Uint8Array(), { identity: 'Participant1' }, 'text');

        // Expectations
        expect(console.log).toHaveBeenCalledWith('mesg', {
          type: 'handRaise',
          handRaised: true,
        });
        expect(service.msgDataReceived.emit).toHaveBeenCalledWith({
          message: { type: 'handRaise', handRaised: true },
          participant: mockParticipant,
        });
        expect(service.handRaised.emit).toHaveBeenCalledWith({
          participant: mockParticipant,
          handRaised: true,
        });
      });
    });
    it('should listen for DataReceived and TrackMuted events on room', function () {
      // Spy on the room's 'on' method and keep track of calls
      const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Emit the TrackMuted event
      const publicationObj = {
        kind: 'audio',
        track: {
          source: 'camera',
        },
        isMuted: true,
      } as any;
      const participantObj = { sid: '1' } as any;
      service.room.emit(RoomEvent.TrackMuted, publicationObj, participantObj);

      // Filter calls to the specific events we're interested in
      const dataReceivedCalls = roomSpy.calls
        .all()
        .filter((call) => call.args[0] === RoomEvent.DataReceived);
      const trackMutedCalls = roomSpy.calls
        .all()
        .filter((call) => call.args[0] === RoomEvent.TrackMuted);

      // Verify that the 'on' method was called for the specific events
      expect(dataReceivedCalls.length).toBe(1);
      expect(trackMutedCalls.length).toBe(1);

      // Verify that the 'on' method was called with the expected arguments
      expect(dataReceivedCalls[0].args[1]).toEqual(jasmine.any(Function));
      expect(trackMutedCalls[0].args[1]).toEqual(jasmine.any(Function));
    });
    it('should set up listener for TrackUnmuted event', function () {
      // Spy on the room's 'on' method
      const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the TrackUnmuted event
      expect(roomSpy).toHaveBeenCalledWith(
        RoomEvent.TrackUnmuted,
        jasmine.any(Function)
      );
    });
    it('should set up listener for LocalTrackUnpublished event and handle it correctly', function () {
      // Setup the service with necessary properties
      const service = {
        room: null as Room | null,
        remoteScreenShare: true,
        audioVideoHandler: function () {
          this.room = new Room();
          this.room.on(
            RoomEvent.LocalTrackUnpublished,
            (
              publication: LocalTrackPublication,
              participant: LocalParticipant
            ) => {
              if (publication.source === Track.Source.ScreenShare) {
                this.remoteScreenShare = false;
              }
            }
          );
        },
      };

      // Spy on the Room class's on method
      spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the LocalTrackUnpublished event
      expect(Room.prototype.on).toHaveBeenCalledWith(
        RoomEvent.LocalTrackUnpublished,
        jasmine.any(Function)
      );

      // Create mock publication and participant objects
      const mockPublication = {
        source: Track.Source.ScreenShare,
      } as LocalTrackPublication;
      const mockParticipant = {
        sid: 'local',
        identity: 'localParticipant',
      } as LocalParticipant;

      // Simulate the LocalTrackUnpublished event
      if (service.room) {
        service.room.emit(
          RoomEvent.LocalTrackUnpublished,
          mockPublication,
          mockParticipant
        );
      }

      // Verify that the remoteScreenShare was set to false
      expect(service.remoteScreenShare).toBe(false);
    });
    it('should set up listener for TrackUnpublished event and handle it correctly', function () {
      // Setup the service with necessary properties
      const service = {
        room: null as Room | null,
        remoteScreenShare: true,
        audioVideoHandler: function () {
          this.room = new Room();
          this.room.on(
            RoomEvent.TrackUnpublished,
            (
              publication: RemoteTrackPublication,
              participant: RemoteParticipant
            ) => {
              if (publication.source === Track.Source.ScreenShare) {
                this.remoteScreenShare = false;
              }
            }
          );
        },
      };

      // Spy on the Room class's on method
      spyOn(Room.prototype, 'on').and.callThrough();

      // Call the audioVideoHandler method
      service.audioVideoHandler();

      // Verify that the 'on' method was called for the TrackUnpublished event
      expect(Room.prototype.on).toHaveBeenCalledWith(
        RoomEvent.TrackUnpublished,
        jasmine.any(Function)
      );

      // Create mock publication and participant objects
      const mockPublication = {
        source: Track.Source.ScreenShare,
      } as RemoteTrackPublication;
      const mockParticipant = {
        sid: 'remote',
        identity: 'remoteParticipant',
      } as RemoteParticipant;

      // Simulate the TrackUnpublished event
      if (service.room) {
        service.room.emit(
          RoomEvent.TrackUnpublished,
          mockPublication,
          mockParticipant
        );
      }

      // Verify that the remoteScreenShare was set to false
      expect(service.remoteScreenShare).toBe(false);
    });

    it('should handle ParticipantConnected event and update participant list', () => {
      // service.audioVideoHandler();

      const spy1 = spyOn(service, 'updateParticipantNames').and.callThrough();
      // const spy2 = spyOn(service.participantNamesUpdated, 'emit');
      // const spy3 = spyOn(service.localParticipantData, 'emit');

      service.audioVideoHandler();

      // participantConnectedEmitter.emit();
      service.room.emit(RoomEvent.ParticipantConnected, {
        identity: 'Name',
      } as any);
      expect(spy1).toHaveBeenCalled();
      // expect(spy2).toHaveBeenCalledWith([mockRemoteParticipants[0]]);
      // expect(spy3).toHaveBeenCalledWith(mockLocalParticipant);
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
  it('should handle LocalTrackUnpublished event and set remoteScreenShare to false', () => {
    // Spy on the room's 'on' method and keep track of calls
    const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the LocalTrackUnpublished event with a screen share publication
    const publicationObj = {
      source: Track.Source.ScreenShare,
    } as any;
    const participantObj = { sid: 'participant1' } as any;
    service.room.emit(
      RoomEvent.LocalTrackUnpublished,
      publicationObj,
      participantObj
    );

    // Verify that the 'on' method was called for the specific event
    expect(roomSpy).toHaveBeenCalledWith(
      RoomEvent.LocalTrackUnpublished,
      jasmine.any(Function)
    );

    // Verify that remoteScreenShare is set to false
    expect(service.remoteScreenShare).toBe(false);
  });
  it('should handle TrackUnpublished event and set remoteScreenShare to false', () => {
    // Spy on the room's 'on' method and keep track of calls
    const roomSpy = spyOn(Room.prototype, 'on').and.callThrough();

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the TrackUnpublished event with a screen share publication
    const publicationObj = {
      source: Track.Source.ScreenShare,
    } as any;
    const participantObj = { sid: 'participant1' } as any;
    service.room.emit(
      RoomEvent.TrackUnpublished,
      publicationObj,
      participantObj
    );

    // Verify that the 'on' method was called for the specific event
    expect(roomSpy).toHaveBeenCalledWith(
      RoomEvent.TrackUnpublished,
      jasmine.any(Function)
    );

    // Verify that remoteScreenShare is set to false
    expect(service.remoteScreenShare).toBe(false);
  });

  it('should handle LocalTrackPublished event and manipulate DOM elements', () => {
    // Mock the necessary DOM elements and dependencies
    const container = document.createElement('div');
    container.classList.add('lk-grid-layout');
    document.body.appendChild(container);
    const publication = {
      track: {
        source: Track.Source.Camera,
        attach: jasmine
          .createSpy('attach')
          .and.returnValue(document.createElement('video')), // Mock the attach method to return a video element
      },
    } as any;
    const participant = {
      sid: 'participant1',
      identity: 'John Doe',
    } as any;

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the LocalTrackPublished event
    service.room.emit(RoomEvent.LocalTrackPublished, publication, participant);

    // Verify that the DOM manipulation and element creation are done correctly
    const participantTile = document.getElementById(participant.sid) as any;
    expect(participantTile).toBeTruthy();
    expect(participantTile.getAttribute('class')).toBe('lk-participant-tile');

    const metadataContainer = participantTile.querySelector(
      '.lk-participant-metadata'
    );
    expect(metadataContainer).toBeTruthy();

    const participantName = metadataContainer.querySelector(
      '.lk-participant-name'
    );
    expect(participantName).toBeTruthy();
    expect(participantName.textContent).toBe(participant.identity);

    const videoElement = participantTile.querySelector('video');
    expect(videoElement).toBeTruthy();
    expect(videoElement.style.width).toBe('100%');
    expect(videoElement.style.height).toBe('100%');
    expect(videoElement.style.objectFit).toBe('cover');

    // Verify that the attach method is called
    expect(publication.track.attach).toHaveBeenCalled();

    // Verify that the 'console.error' and 'openSnackBar' are called if the container is not found
    const consoleErrorSpy = spyOn(console, 'error').and.callThrough();
    const openSnackBarSpy = spyOn(service, 'openSnackBar').and.callThrough();
    container.remove(); // Remove the container to simulate container not found

    // Emit the event again to trigger error handling
    service.room.emit(RoomEvent.LocalTrackPublished, publication, participant);

    // Verify that error handling is done appropriately
    expect(console.error).toHaveBeenCalledWith(
      'Remote video container not found'
    );
    expect(service.openSnackBar).toHaveBeenCalledWith(
      'Video could not open. Try again later'
    );

    // Restore the spies
    consoleErrorSpy.and.callThrough();
    openSnackBarSpy.and.callThrough();
  });

  it('should handle TrackPublished event and set track subscription to true', () => {
    // Mock the necessary dependencies
    const publication = {
      setSubscribed: jasmine.createSpy('setSubscribed'), // Mock the setSubscribed method
    } as any;
    const participant = { sid: 'participant1' } as any;

    // Call the method that sets up the event listener
    service.audioVideoHandler();

    // Emit the TrackPublished event
    service.room.emit(RoomEvent.TrackPublished, publication, participant);

    // Verify that the setSubscribed method is called with true
    expect(publication.setSubscribed).toHaveBeenCalledWith(true);
  });
});
