import {
  ComponentFixture,
  TestBed,
  async,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { ElementRef } from '@angular/core';
import { LiveKitRoomComponent } from './live-kit-room.component';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';

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

  beforeEach(async () => {
    // mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);
    // mockMatSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    // toggleVideo: jasmine
    //   .createSpy('toggleVideo')
    //   .and.returnValue(Promise.resolve());
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
    };
    // mockLivekitService = {
    //   localParticipantData: new Subject<any>(),
    // };
    // mockLivekitService = {
    //   messageEmitter: messageEmitter.asObservable(),
    // };
    // mockLivekitService = {
    // };
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
      ],
      declarations: [LiveKitRoomComponent],
      // providers: [
      //   { provide: LiveKitService, useValue: mockLiveKitService },
      //   { provide: MatDialog, useValue: mockMatDialog },
      //   { provide: MatSnackBar, useValue: mockMatSnackBar },
      // ],
      // providers: [LiveKitService, MatSnackBar],
      providers: [
        { provide: LiveKitService },
        // { provide: LiveKitService, useClass: MockLiveKitService },
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
    // component.chatForm = new FormBuilder().group({
    //   message: ['test message'], // Set a default value for testing
    // });
    // spyOn(component, 'scrollToBottom').and.callFake(() => {});
    fixture.detectChanges();
    // Mock the messageContainer
    // component.messageContainer = new ElementRef({
    //   scrollTop: 0,
    //   scrollHeight: 1000,
    // });
  });
  afterEach(() => {
    fixture.destroy();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  // it('should create the form with an empty message field', () => {
  //   expect(component.chatForm).toBeDefined();
  //   expect(component.chatForm.get('message')).toBeDefined();
  //   expect(component.chatForm.get('message')?.value).toBe('');
  // });

  // it('should send message, reset form, and scroll to bottom', () => {
  //   // Mock the chatForm and scrollToBottom inside the test block
  //   // component.chatForm = new FormBuilder().group({
  //   //   message: ['test message'], // Set a default value for testing
  //   // });
  //   // spyOn(component, 'scrollToBottom').and.callFake(() => {});
  //   component.sendMessage();

  //   expect(component.chatForm).toBeDefined();
  //   expect(mockLivekitService.sendChatMessage).toHaveBeenCalledWith({
  //     msg: { message: 'test message' },
  //   });
  //   expect(component.chatForm.value.message).toBe(''); // Form should be reset
  //   expect(component.scrollToBottom).toHaveBeenCalled();
  // });
  // it('should increment unreadMessagesCount if chatSideWindowVisible is false', () => {
  //   component.chatSideWindowVisible = false;
  //   fixture.detectChanges();
  //   const data = {
  //     message: { message: 'Hello', timestamp: '2024-05-23T12:34:56Z' },
  //     participant: { identity: 'John Doe' },
  //   };
  //   msgDataReceived.next(data);
  //   expect(component.unreadMessagesCount).toBe(1);
  // });

  it('should not increment unreadMessagesCount if chatSideWindowVisible is true', () => {
    component.chatSideWindowVisible = true;
    msgDataReceived.next({
      message: { message: 'Hello', timestamp: '2024-05-23T12:34:56Z' },
      participant: { identity: 'John Doe' },
    });
    expect(component.unreadMessagesCount).toBe(0);
  });

  it('should toggle chatSideWindowVisible, hide participantSideWindowVisible, reset unreadMessagesCount', () => {
    spyOn(component, 'scrollToBottom');

    // Arrange
    component.chatSideWindowVisible = false;
    component.participantSideWindowVisible = true;
    component.unreadMessagesCount = 5;

    //Act
    component.openChatSideWindow();

    // Assert
    expect(component.chatSideWindowVisible).toBe(true);
    expect(component.participantSideWindowVisible).toBe(false);
    expect(component.unreadMessagesCount).toBe(0);
    expect(component.scrollToBottom).toHaveBeenCalled();

    // Reset the spy for the next state change
    (component.scrollToBottom as jasmine.Spy).calls.reset();

    // Again start to act
    component.openChatSideWindow();

    //Assert
    expect(component.chatSideWindowVisible).toBe(false);
    expect(component.participantSideWindowVisible).toBe(false);
    expect(component.unreadMessagesCount).toBe(0);
    expect(component.scrollToBottom).not.toHaveBeenCalled();
  });
  it('should not call scrollToBottom or reset unreadMessagesCount when closing the chat side window', () => {
    spyOn(component, 'scrollToBottom');

    // Arrange
    component.chatSideWindowVisible = true;
    component.participantSideWindowVisible = true;
    component.unreadMessagesCount = 5;

    // Act
    component.openChatSideWindow();

    // After the call, chatSideWindowVisible should be toggled to false
    expect(component.chatSideWindowVisible).toBe(false);
    // participantSideWindowVisible should still be false
    expect(component.participantSideWindowVisible).toBe(false);
    // unreadMessagesCount should not be reset
    expect(component.unreadMessagesCount).toBe(5);
    // scrollToBottom should not be called
    expect(component.scrollToBottom).not.toHaveBeenCalled();
  });

  // it('should toggle video state locally and call livekitService.toggleVideo', fakeAsync(() => {
  //   spyOn(component, 'openSnackBar');
  //   const toggleVideo = mockLivekitService.toggleVideo.and.returnValue(
  //     Promise.resolve()
  //   );
  //   // Initial state check
  //   expect(component.isVideoOn).toBeTrue();

  //   component.toggleVideo();
  //   tick(); // Ensure all asynchronous operations are completed

  //   expect(component.isVideoOn).toBeFalse();
  //   expect(toggleVideo).toHaveBeenCalled();
  //   expect(component.openSnackBar).not.toHaveBeenCalled();
  // }));

  // it('should handle error when toggling video', fakeAsync(() => {
  //   const error = new Error('Test Error');
  //   const liveKitToggle = mockLivekitService.toggleVideo.and.returnValue(
  //     Promise.reject(error)
  //   );
  //   spyOn(component, 'openSnackBar');

  //   // Initial state check
  //   expect(component.isVideoOn).toBeTrue();

  //   component.toggleVideo();
  //   tick(); // Ensure all asynchronous operations are completed

  //   // expect(component.isVideoOn).toBeTrue();
  //   expect(liveKitToggle).toHaveBeenCalled();
  //   expect(component.openSnackBar).toHaveBeenCalledWith(
  //     Error toggling video: ${error.message}
  //   );
  // }));
  it('should start the meeting successfully', fakeAsync(() => {
    // spyOn(mockMatDialog, 'open');

    component.startMeeting();
    tick();

    expect(mockLivekitService.connectToRoom).toHaveBeenCalledWith(
      'wss://vc-ua59wquz.livekit.cloud',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ikhhc3NhbSB3b3JsZCIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZX0sImlhdCI6MTcxNjUzMDIzMywibmJmIjoxNzE2NTMwMjMzLCJleHAiOjE3MTY1NTE4MzMsImlzcyI6IkFQSVVXYkVLN0JndjR1ayIsInN1YiI6Ikhhc3NhbSIsImp0aSI6Ikhhc3NhbSJ9.menyhCTpjPtsONC4jCEEmz0wSGjkKNARh0ngeVQA6DQ'
    );
    expect(mockLivekitService.enableCameraAndMicrophone).toHaveBeenCalled();
    expect(component.isMeetingStarted).toBeTrue();
    expect(mockMatDialog.open).not.toHaveBeenCalled();
  }));

  it('should handle error during connectToRoom', fakeAsync(() => {
    const error = new Error('Test Connection Error');
    mockLivekitService.connectToRoom.and.returnValue(Promise.reject(error));
    // spyOn(mockMatDialog, 'open');

    component.startMeeting();
    tick(); // Simulate the asynchronous passage of time

    expect(mockLivekitService.connectToRoom).toHaveBeenCalledWith(
      'wss://vc-ua59wquz.livekit.cloud',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ikhhc3NhbSB3b3JsZCIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZX0sImlhdCI6MTcxNjUzMDIzMywibmJmIjoxNzE2NTMwMjMzLCJleHAiOjE3MTY1NTE4MzMsImlzcyI6IkFQSVVXYkVLN0JndjR1ayIsInN1YiI6Ikhhc3NhbSIsImp0aSI6Ikhhc3NhbSJ9.menyhCTpjPtsONC4jCEEmz0wSGjkKNARh0ngeVQA6DQ'
    );
    expect(mockLivekitService.enableCameraAndMicrophone).not.toHaveBeenCalled();
    expect(component.isMeetingStarted).toBeFalse();
    expect(mockMatDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
      data: { message: `Error starting meeting: ${error.message}` },
    });
  }));

  it('should handle error during enableCameraAndMicrophone', fakeAsync(() => {
    const error = new Error('Test Camera and Microphone Error');
    mockLivekitService.enableCameraAndMicrophone.and.returnValue(
      Promise.reject(error)
    );
    // spyOn(mockMatDialog, 'open');

    component.startMeeting();
    tick();

    expect(mockLivekitService.connectToRoom).toHaveBeenCalled();
    expect(mockLivekitService.enableCameraAndMicrophone).not.toHaveBeenCalled();
    expect(mockMatDialog.open).toHaveBeenCalledWith(ErrorDialogComponent, {
      data: { message: `Error Enable camera and microphone: ${error.message}` },
    });
  }));

  it('should toggle screen share', fakeAsync(() => {
    mockLivekitService.toggleScreenShare.and.returnValue(Promise.resolve());

    component.toggleScreenShare();
    tick();

    expect(mockLivekitService.toggleScreenShare).toHaveBeenCalled();
    expect(component.isScreenSharing).toBe(true);
    expect(component.iconColor).toBe('green');
  }));

  it('should toggle video', async(() => {
    component.toggleVideo().then(() => {
      expect(mockLiveKitService.toggleVideo).toHaveBeenCalled();
      expect(component.isVideoOn).toBe(false);
    });
  }));

  it('should toggle microphone', fakeAsync(() => {
    mockLivekitService.toggleMicrophone.and.returnValue(Promise.resolve());

    component.toggleMic();
    tick(); // Simulate passage of time for async operations

    expect(mockLivekitService.toggleMicrophone).toHaveBeenCalled();
    expect(component.isMicOn).toBe(false);
  }));

  it('should open participant side window', () => {
    component.openParticipantSideWindow();
    expect(component.participantSideWindowVisible).toBe(true);
    expect(component.chatSideWindowVisible).toBe(false);
  });

  it('should close participant side window', () => {
    component.closeParticipantSideWindow();
    expect(component.participantSideWindowVisible).toBe(false);
  });

  it('should open chat side window', () => {
    component.openChatSideWindow();
    expect(component.chatSideWindowVisible).toBe(true);
    expect(component.participantSideWindowVisible).toBe(false);
  });

  it('should close chat side window', () => {
    component.closeChatSideWindow();
    expect(component.chatSideWindowVisible).toBe(false);
  });

  it('should send a message', () => {
    // spyOn(mockLivekitService, 'sendChatMessage');
    spyOn(component, 'scrollToBottom');
    component.chatForm.setValue({ message: 'Test Message' });
    component.sendMessage();
    expect(mockLiveKitService.sendChatMessage).toHaveBeenCalledWith({
      msg: { message: 'Test Message' },
    });
    expect(component.chatForm.value.message).toBe('');
    expect(component.scrollToBottom).toHaveBeenCalled();
  });

  it('should handle snack bar opening', () => {
    component.openSnackBar('Test Message');
    expect(mockMatSnackBar.open).toHaveBeenCalledWith('Test Message', 'Close', {
      duration: 3000,
    });
  });

  describe('scrollToBottom', () => {
    it('should scroll to the bottom of the message container', fakeAsync(() => {
      component.messageContainer = {
        nativeElement: {
          scrollTop: 0,
          scrollHeight: 1000,
        },
      };

      component.scrollToBottom();
      tick(120);

      expect(component.messageContainer.nativeElement.scrollTop).toBe(1000);
    }));

    it('should handle errors gracefully', () => {
      component.messageContainer = null;

      expect(() => component.scrollToBottom()).not.toThrow();
    });
  });

  // describe('shouldShowAvatar', () => {
  //   it('should return true for the first message', () => {
  //     component.allMessages = [{ senderName: 'Alice' }];

  //     expect(component.shouldShowAvatar(0)).toBeTrue();
  //   });

  //   it('should return true for different sender from the previous message', () => {
  //     component.allMessages = [{ senderName: 'Alice' }, { senderName: 'Bob' }];

  //     expect(component.shouldShowAvatar(1)).toBeTrue();
  //   });

  //   it('should return false for the same sender as the previous message', () => {
  //     component.allMessages = [
  //       { senderName: 'Alice' },
  //       { senderName: 'Alice' },
  //     ];

  //     expect(component.shouldShowAvatar(1)).toBeFalse();
  //   });
  // });
});
