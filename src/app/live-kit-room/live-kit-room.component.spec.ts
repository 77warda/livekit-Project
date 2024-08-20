import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { LiveKitRoomComponent } from './live-kit-room.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { Store, StoreModule } from '@ngrx/store';
import * as LiveKitRoomActions from '../redux/actions';

class MockLiveKitService {
  toggleVideo() {
    return Promise.resolve();
  }
}
describe('LiveKitRoomComponent;', () => {
  let component: LiveKitRoomComponent;
  let fixture: ComponentFixture<LiveKitRoomComponent>;
  let mockLiveKitService: LiveKitService;
  let mockMatDialog: MatDialog;
  let mockMatSnackBar: MatSnackBar;
  let mockLivekitService: any;
  let msgDataReceived: Subject<any>;
  let messageEmitter: Subject<any>;
  let store: any;
  let dispatchSpy: jasmine.Spy;
  let mockLiveKit: jasmine.SpyObj<LiveKitService>;
  let formBuilder: FormBuilder;

  const GRIDCOLUMN: { [key: number]: string } = {
    1: 'repeat(1, 1fr)',
    2: 'repeat(2, 1fr)',
    3: 'repeat(3, 1fr)',
    4: 'repeat(4, 1fr)',
    5: 'repeat(5, 1fr)',
    6: 'repeat(6, 1fr)',
  };
  beforeEach(async () => {
    mockLiveKit = jasmine.createSpyObj('LiveKitService', ['sendChatMessage']);
    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    mockLivekitService = {
      localParticipantData: msgDataReceived.asObservable(),
      messageEmitter: messageEmitter.asObservable(),
      msgDataReceived: msgDataReceived.asObservable(),
      sendChatMessage: jasmine.createSpy('sendChatMessage'),
      toggleVideo: jasmine
        .createSpy('toggleVideo')
        .and.returnValue(Promise.resolve()),
      connectToRoom: jasmine
        .createSpy('connectToRoom')
        .and.returnValue(Promise.resolve()),
      enableCameraAndMicrophone: jasmine
        .createSpy('enableCameraAndMicrophone')
        .and.returnValue(Promise.resolve()),
      room: {
        get numParticipants() {
          return 0; // default value
        },
      },
    };
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        StoreModule.forRoot({}),
      ],
      declarations: [LiveKitRoomComponent],
      providers: [
        { provide: LiveKitService },
        // { provide: LiveKitService, useClass: MockLiveKitService },
        FormBuilder,
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('MatDialog', ['open']),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('MatSnackBar', ['open']),
        },
      ],
    });

    mockLiveKitService = TestBed.inject(LiveKitService);
    mockMatDialog = TestBed.inject(MatDialog);
    mockMatSnackBar = TestBed.inject(MatSnackBar);
    fixture = TestBed.createComponent(LiveKitRoomComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    dispatchSpy = spyOn(store, 'dispatch');
    formBuilder = TestBed.inject(FormBuilder);

    // Initialize the form
    component.chatForm = formBuilder.group({
      message: [''],
      participant: [''],
    });

    fixture.detectChanges();
  });
  // afterEach(() => {
  //   fixture.destroy();
  // });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  describe('start meeting', () => {
    it('should dispatch startMeeting action with correct payload', async () => {
      const dynamicToken = 'some-token';
      component.startForm.value.token = dynamicToken;

      await component.startMeeting();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.startMeeting({
          wsURL: 'wss://warda-ldb690y8.livekit.cloud',
          token: dynamicToken,
        })
      );
    });
  });

  describe('Sort Messages', () => {
    it('should sort messages by receivingTime or sendingTime in ascending order', () => {
      const messages = [
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
        { sendingTime: '2022-01-01T08:00:00.000Z' },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        { sendingTime: '2022-01-01T08:00:00.000Z' },
        { sendingTime: '2022-01-01T09:00:00.000Z' },
        { receivingTime: '2022-01-01T10:00:00.000Z' },
        { receivingTime: '2022-01-01T11:00:00.000Z' },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should sort messages by receivingTime if both receivingTime and sendingTime are present', () => {
      const messages = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      component.allMessages = messages;
      component.sortMessages();

      const expectedOrder = [
        {
          receivingTime: '2022-01-01T10:00:00.000Z',
          sendingTime: '2022-01-01T09:00:00.000Z',
        },
        {
          receivingTime: '2022-01-01T11:00:00.000Z',
          sendingTime: '2022-01-01T10:00:00.000Z',
        },
      ];

      expect(component.allMessages).toEqual(expectedOrder);
    });

    it('should not throw an error if allMessages is empty', () => {
      component.allMessages = [];
      expect(() => component.sortMessages()).not.toThrow();
    });
  });

  describe('toggleScreen share', () => {
    it('should dispatch toggleScreenShare action when toggleScreenShare is called', async () => {
      await component.toggleScreenShare();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleScreenShare()
      );
    });
  });
  describe('toggle Microphone', () => {
    it('should dispatch toggleMic action when toggleMic is called', async () => {
      await component.toggleMic();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(LiveKitRoomActions.toggleMic());
    });
  });
  describe('Open Participant Side Window', () => {
    it('should dispatch toggleParticipantSideWindow action when openParticipantSideWindow is called', () => {
      component.openParticipantSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleParticipantSideWindow()
      );
    });
  });
  describe('Open Chat Side Window', () => {
    it('should dispatch toggleChatSideWindow action when openChatSideWindow is called', () => {
      component.openChatSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.toggleChatSideWindow()
      );
    });
  });
  describe('Close Chat Side Window', () => {
    it('should dispatch closeChatSideWindow action when closeChatSideWindow is called', () => {
      component.closeChatSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.closeChatSideWindow()
      );
    });
  });
  describe('Close Participant Side Window', () => {
    it('should dispatch closeParticipantSideWindow action when closeParticipantSideWindow is called', () => {
      component.closeParticipantSideWindow();

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.closeParticipantSideWindow()
      );
    });
  });
  it('should handle snack bar opening', () => {
    component.openSnackBar('Test Message');
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
      duration: 3000,
    });
  });

  describe('shouldShowAvatar', () => {
    it('should return true for the first message', () => {
      component.allMessages = [{ senderName: 'Alice' }];

      expect(component.shouldShowAvatar(0)).toBeTrue();
    });

    it('should return true for different sender from the previous message', () => {
      component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

      expect(component.shouldShowAvatar(1)).toBeTrue();
    });

    it('should return false for the same sender as the previous message', () => {
      component.allMessages = [
        { senderName: 'Alice' },
        { senderName: 'Alice' },
      ];

      expect(component.shouldShowAvatar(1)).toBeFalse();
    });
  });
  describe('Extract Initials', () => {
    it('should extract initials from a single word name', () => {
      const name = 'John';
      const expectedInitials = 'J';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a multi-word name', () => {
      const name = 'John Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should extract initials from a name with multiple spaces', () => {
      const name = 'John  Doe';
      const expectedInitials = 'JD';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });

    it('should return an empty string for an empty name', () => {
      const name = '';
      const expectedInitials = '';

      const initials = component.extractInitials(name);

      expect(initials).toBe(expectedInitials);
    });
  });

  describe('leave button', () => {
    it('should dispatch leaveMeeting action when leaveBtn is called', async () => {
      await component.leaveBtn();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        LiveKitRoomActions.leaveMeeting()
      );
    });

    it('should return a promise that resolves to void', async () => {
      const result = await component.leaveBtn();
      expect(result).toBeUndefined();
    });
  });

  it('should dispatch toggleVideo action when toggleVideo is called', async () => {
    await component.toggleVideo();

    expect(dispatchSpy).toHaveBeenCalledWith(LiveKitRoomActions.toggleVideo());
  });

  it('should return "repeat(auto-fill, minmax(200px, 1fr))" for more than 6 participants', () => {
    spyOnProperty(
      mockLiveKitService.room,
      'numParticipants',
      'get'
    ).and.returnValue(7);
    expect(component.GalleryGridColumnStyle).toBe(
      'repeat(auto-fill, minmax(200px, 1fr))'
    );
  });

  it('should return correct grid column style for more than 6 screen shares', () => {
    // Arrange: Set screenShareCount to a value greater than 6
    mockLiveKitService.screenShareCount = 7;

    // Act: Access the getter
    const result = component.ScreenGalleryGridColumnStyle;

    // Assert: Check the result matches the expected fallback value
    expect(result).toBe('repeat(auto-fill, minmax(200px, 1fr))');
  });
  it('should scroll to bottom of message container', fakeAsync(() => {
    // Arrange
    const messageContainerElement = new ElementRef<HTMLDivElement>(
      document.createElement('div')
    );
    component.messageContainer = messageContainerElement;
    Object.defineProperty(
      messageContainerElement.nativeElement,
      'scrollHeight',
      { value: 1000, configurable: true }
    );
    Object.defineProperty(messageContainerElement.nativeElement, 'scrollTop', {
      value: 0,
      writable: true,
    });

    // Act
    component.scrollToBottom();
    tick(100); // wait for the setTimeout to complete

    // Assert
    expect(messageContainerElement.nativeElement.scrollTop).toBe(1000);
  }));
});
