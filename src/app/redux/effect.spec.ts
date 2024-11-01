import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { LiveKitService } from '../livekit.service';
import * as LiveKitRoomActions from './actions';
import { Action, Store, StoreModule } from '@ngrx/store';
import { LiveKitRoomEffects } from './effect';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { selectBreakoutRoomsData, selectNextRoomIndex } from './selectors';
import { MeetingService } from '../Meeting-Service/meeting.service';

describe('LiveKitRoomEffects', () => {
  let actions$: Observable<Action>;
  let effects: LiveKitRoomEffects;
  let livekitService: jasmine.SpyObj<LiveKitService>;
  let meetingService: jasmine.SpyObj<MeetingService>;
  const initialState = { nextRoomIndex: 1 };
  let store: MockStore;

  beforeEach(() => {
    const livekitServiceSpy = jasmine.createSpyObj('LiveKitService', [
      'connectToRoom',
      'toggleScreenShare',
      'toggleVideo',
      'toggleMicrophone',
      'enableCameraAndMicrophone',
      'disconnectRoom',
      'sendChatMessage',
      'sendMessageToBreakoutRoom',
      'sendMessageToMainRoom',
      'breakoutRoomAlert',
    ]);
    livekitServiceSpy.breakoutRoomsDataUpdated = {
      emit: jasmine.createSpy('emit'),
    };
    meetingService = jasmine.createSpyObj('MeetingService', ['createMeeting']);
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, HttpClientModule, StoreModule.forRoot({})],
      providers: [
        LiveKitRoomEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        { provide: LiveKitService, useValue: livekitServiceSpy },
        { provide: MeetingService, useValue: meetingService },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
        },
      ],
    });

    effects = TestBed.inject(LiveKitRoomEffects);
    store = TestBed.inject(Store) as MockStore;
    livekitService = TestBed.inject(
      LiveKitService
    ) as jasmine.SpyObj<LiveKitService>;
    meetingService = TestBed.inject(
      MeetingService
    ) as jasmine.SpyObj<MeetingService>;
  });

  describe('startMeeting$', () => {
    it('should dispatch startMeetingSuccess on successful connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const action = LiveKitRoomActions.LiveKitActions.startMeeting({
        wsURL,
        token,
      });
      const successAction =
        LiveKitRoomActions.LiveKitActions.startMeetingSuccess();

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.resolve());

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch startMeetingFailure on failed connection', (done) => {
      const wsURL = 'wss://example.com';
      const token = 'example-token';
      const error = new Error('Connection failed');
      const action = LiveKitRoomActions.LiveKitActions.startMeeting({
        wsURL,
        token,
      });
      const failureAction =
        LiveKitRoomActions.LiveKitActions.startMeetingFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.connectToRoom.and.returnValue(Promise.reject(error));

      effects.startMeeting$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('toggleScreenShare$', () => {
    it('should dispatch toggleScreenShareSuccess on successful toggle', (done) => {
      const isScreenSharing = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
      const successAction =
        LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess({
          isScreenSharing,
        });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(
        Promise.resolve(isScreenSharing)
      );

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleScreenShareFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.LiveKitActions.toggleScreenShare();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.toggleScreenShare.and.returnValue(Promise.reject(error));

      effects.toggleScreenShare$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleVideo$', () => {
    it('should dispatch toggleVideoSuccess on successful toggle', (done) => {
      const isVideoOn = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
      const successAction =
        LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({
          isVideoOn,
        });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(of(isVideoOn));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleVideoFailure on failed toggle', (done) => {
      const error = new Error('Toggle failed');
      const action = LiveKitRoomActions.LiveKitActions.toggleVideo();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.toggleVideo.and.returnValue(throwError(error));

      effects.toggleVideo$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('toggleMicrophone$', () => {
    it('should dispatch toggleMicSuccess on successful toggle', (done) => {
      const isMicOn = true;
      const action = LiveKitRoomActions.LiveKitActions.toggleMic();
      const successAction = LiveKitRoomActions.LiveKitActions.toggleMicSuccess({
        isMicOn,
      });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(of(isMicOn));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch toggleMicFailure on failed toggle', (done) => {
      const error = 'Toggle failed'; // Use a string for consistency
      const action = LiveKitRoomActions.LiveKitActions.toggleMic();
      const failureAction = LiveKitRoomActions.LiveKitActions.toggleMicFailure({
        error,
      });

      actions$ = of(action);
      livekitService.toggleMicrophone.and.returnValue(throwError(error));

      effects.toggleMicrophone$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });

  describe('enableCameraAndMicrophone$', () => {
    it('should dispatch enableCameraAndMicrophoneSuccess on successful enable', (done) => {
      const action =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
      const successAction =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneSuccess();

      actions$ = of(action);
      livekitService.enableCameraAndMicrophone.and.returnValue(
        Promise.resolve()
      ); // Simulate success with resolved Promise

      effects.enableCameraAndMicrophone$.subscribe((result) => {
        expect(result).toEqual(successAction);
        done();
      });
    });

    it('should dispatch enableCameraAndMicrophoneFailure on failed enable', (done) => {
      const error = new Error('Enable failed');
      const action =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophone();
      const failureAction =
        LiveKitRoomActions.LiveKitActions.enableCameraAndMicrophoneFailure({
          error: error.message,
        });

      actions$ = of(action);
      livekitService.enableCameraAndMicrophone.and.returnValue(
        Promise.reject(error)
      ); // Simulate failure with rejected Promise

      effects.enableCameraAndMicrophone$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('leaveMeeting$', () => {
    it('should dispatch leaveMeetingSuccess on successful disconnect', (done) => {
      const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
      const successAction =
        LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();

      actions$ = of(action);
      livekitService.disconnectRoom.and.returnValue(of(void 0)); // Simulate successful disconnect

      effects.leaveMeeting$.subscribe((result) => {
        expect(result).toEqual(successAction);
        expect(livekitService.disconnectRoom).toHaveBeenCalled();
        done();
      });
    });

    it('should dispatch leaveMeetingFailure on failed disconnect', (done) => {
      const error = new Error('Disconnect failed');
      const action = LiveKitRoomActions.MeetingActions.leaveMeeting();
      const failureAction =
        LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
          error: error.message, // Ensure it's error.message to compare strings
        });

      actions$ = of(action);
      livekitService.disconnectRoom.and.returnValue(throwError(() => error)); // Simulate failed disconnect

      effects.leaveMeeting$.subscribe((result) => {
        expect(result).toEqual(failureAction);
        done();
      });
    });
  });
  describe('sendChatMessage$', () => {
    it('should call sendChatMessage on LiveKitService with correct parameters', () => {
      const msg = 'Hello!';
      const recipient = 'user123';
      const action = LiveKitRoomActions.ChatActions.sendChatMessage({
        msg,
        recipient,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);

      effects.sendChatMessage$.subscribe(() => {
        expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
          msg,
          recipient,
        });
      });
    });

    it('should not dispatch any action', () => {
      const msg = 'Hello!';
      const recipient = 'user123';
      const action = LiveKitRoomActions.ChatActions.sendChatMessage({
        msg,
        recipient,
      });

      actions$ = of(action);

      effects.sendChatMessage$.subscribe(() => {
        // No actions should be dispatched
        expect(livekitService.sendChatMessage).toHaveBeenCalledWith({
          msg,
          recipient,
        });
      });
    });
  });

  describe('sendMessageToBreakoutRoom$', () => {
    it('should dispatch sendMessageToBreakoutRoomSuccess on success', (done) => {
      const breakoutRoom = 'room1';
      const messageContent = 'Hello, Breakout Room!';
      const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom,
        messageContent,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      livekitService.sendMessageToBreakoutRoom.and.returnValue(of(null)); // Simulate success

      effects.sendMessageToBreakoutRoom$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomSuccess()
        );
        done();
      });
    });

    it('should dispatch sendMessageToBreakoutRoomFailure on error', (done) => {
      const breakoutRoom = 'room1';
      const messageContent = 'Hello, Breakout Room!';
      const action = LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom({
        breakoutRoom,
        messageContent,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      const error = new Error('Failed to send message');
      livekitService.sendMessageToBreakoutRoom.and.returnValue(
        throwError(error)
      ); // Simulate error

      effects.sendMessageToBreakoutRoom$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomFailure({
            error,
          })
        );
        done();
      });
    });
  });

  describe('sendHelpRequest$', () => {
    it('should dispatch sendHelpRequestSuccess on successful request', (done) => {
      const roomName = 'mainRoom';
      const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
        roomName,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      livekitService.sendMessageToMainRoom.and.returnValue(of(null)); // Simulate success

      effects.sendHelpRequest$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendHelpRequestSuccess()
        );
        done();
      });
    });

    it('should dispatch sendHelpRequestFailure on error', (done) => {
      const roomName = 'mainRoom';
      const action = LiveKitRoomActions.ChatActions.sendHelpRequest({
        roomName,
      });

      // Set the actions$ observable to emit the action
      actions$ = of(action);
      const error = new Error('Failed to send help request');
      livekitService.sendMessageToMainRoom.and.returnValue(throwError(error)); // Simulate error

      effects.sendHelpRequest$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.ChatActions.sendHelpRequestFailure({ error })
        );
        done();
      });
    });
  });
  describe('initiateCreateNewRoom$', () => {
    it('should dispatch createNewRoomSuccess with the new room name', (done) => {
      const action = LiveKitRoomActions.BreakoutActions.initiateCreateNewRoom();
      actions$ = of(action);

      // Mock the selector to return the nextRoomIndex
      store.overrideSelector(selectNextRoomIndex, 1); // Simulating that the next room index is 1

      effects.initiateCreateNewRoom$.subscribe((result) => {
        expect(result).toEqual(
          LiveKitRoomActions.BreakoutActions.createNewRoomSuccess({
            roomName: 'Breakout_Room_1', // Expected room name
          })
        );
        done();
      });
    });
  });
  describe('initiateManualRoomSelection$', () => {
    it('should send invitations for manually selected rooms', () => {
      const roomType = 'manual';
      const action =
        LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
          roomType,
        });

      const mockBreakoutRoomsData = [
        {
          participantIds: ['user1', 'user2'],
          roomName: 'Room_1',
          showAvailableParticipants: true,
        },
        {
          participantIds: [],
          roomName: 'Room_2',
          showAvailableParticipants: false,
        },
        {
          participantIds: ['user3'],
          roomName: 'Room_3',
          showAvailableParticipants: true,
        },
      ];

      // Set up the store to return the mock breakout rooms data
      store.overrideSelector(selectBreakoutRoomsData, mockBreakoutRoomsData);
      actions$ = of(action); // Simulate the action being dispatched

      effects.initiateManualRoomSelection$.subscribe(() => {
        // Verify the service methods were called correctly
        expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
          ['user1', 'user2'],
          'Room_1'
        );
        expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
          ['user3'],
          'Room_3'
        );
        expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalledWith(
          [],
          'Room_2'
        );
        expect(
          livekitService.breakoutRoomsDataUpdated.emit
        ).toHaveBeenCalledWith(mockBreakoutRoomsData);
      });
    });

    it('should log no breakout rooms configured if the data is empty', () => {
      const roomType = 'manual';
      const action =
        LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
          roomType,
        });

      // Set up the store to return an empty array
      store.overrideSelector(selectBreakoutRoomsData, []);
      actions$ = of(action); // Simulate the action being dispatched

      effects.initiateManualRoomSelection$.subscribe(() => {
        // Verify the service methods were not called
        expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();
        expect(
          livekitService.breakoutRoomsDataUpdated.emit
        ).toHaveBeenCalledWith([]);
      });
    });
    it('should not process any actions if roomType is not manual', () => {
      const roomType = 'auto'; // or any other type that is not 'manual'
      const action =
        LiveKitRoomActions.BreakoutActions.initiateManualRoomSelection({
          roomType,
        });

      actions$ = of(action); // Simulate the action being dispatched

      effects.initiateManualRoomSelection$.subscribe(() => {
        // Since dispatch is false, we don't expect any further emissions
      });

      // Verify that the LiveKitService methods were not called
      expect(livekitService.breakoutRoomAlert).not.toHaveBeenCalled();
      expect(
        livekitService.breakoutRoomsDataUpdated.emit
      ).not.toHaveBeenCalled();
    });
  });
  describe('AutomaticRoomSelection$', () => {
    it('should create automatic rooms and emit updates', () => {
      const participants = ['user1', 'user2', 'user3', 'user4', 'user5'];
      const numberOfRooms = 2;
      const action =
        LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation({
          participants,
          numberOfRooms,
        });

      actions$ = of(action); // Simulate the action being dispatched

      const expectedRoomsData = [
        {
          participantIds: ['user1', 'user2'],
          roomName: 'Breakout_Room_1',
          type: 'automatic',
        },
        {
          participantIds: ['user3', 'user4', 'user5'],
          roomName: 'Breakout_Room_2',
          type: 'automatic',
        },
      ];

      effects.createAutomaticRooms$.subscribe(() => {
        // Verify the service methods were called correctly
        expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
          ['user1', 'user2'],
          'Breakout_Room_1'
        );
        expect(livekitService.breakoutRoomAlert).toHaveBeenCalledWith(
          ['user3', 'user4', 'user5'],
          'Breakout_Room_2'
        );
        expect(
          livekitService.breakoutRoomsDataUpdated.emit
        ).toHaveBeenCalledWith(expectedRoomsData);
      });
    });
  });
  it('should dispatch startMeeting action with the token on successful meeting creation for multiple participants', (done) => {
    // Arrange
    const participantNames = ['Alice', 'Bob'];
    const roomName = 'TestRoom';
    const action = LiveKitRoomActions.MeetingActions.createMeeting({
      participantNames,
      roomName,
    });
    const mockTokens = ['tokenAlice', 'tokenBob'];

    // Mock the service response for each participant
    meetingService.createMeeting.and.callFake((name: string) => {
      if (name === 'Alice') {
        return of({ token: mockTokens[0] });
      } else if (name === 'Bob') {
        return of({ token: mockTokens[1] });
      }
      return throwError('Unexpected participant name');
    });

    actions$ = of(action);

    // Act
    effects.createMeeting$.subscribe((resultAction) => {
      // Assert
      expect(resultAction).toEqual(
        LiveKitRoomActions.LiveKitActions.startMeeting({
          wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
          token: mockTokens[0], // Using the first token in the array
        })
      );
      done();
    });
  });

  it('should dispatch createMeetingFailure action on error', (done) => {
    // Arrange
    const participantNames = ['Alice'];
    const roomName = 'TestRoom';
    const action = LiveKitRoomActions.MeetingActions.createMeeting({
      participantNames,
      roomName,
    });
    const errorResponse = new Error('Meeting creation failed');

    // Mock the service to return an error for the participant
    meetingService.createMeeting.and.returnValue(throwError(errorResponse));

    actions$ = of(action);

    // Act
    effects.createMeeting$.subscribe((resultAction) => {
      // Assert
      expect(resultAction).toEqual(
        LiveKitRoomActions.MeetingActions.createMeetingFailure({
          error: errorResponse,
        })
      );
      done();
    });
  });
});
