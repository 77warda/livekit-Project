import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LiveKitRoomComponent } from './live-kit-room.component';
import { LiveKitService } from '../livekit.service';
import { Subject } from 'rxjs';

describe('LiveKitRoomComponent', () => {
  let component: LiveKitRoomComponent;
  let fixture: ComponentFixture<LiveKitRoomComponent>;
  let mockLiveKitService: LiveKitService;
  let mockMatDialog: MatDialog;
  let mockMatSnackBar: MatSnackBar;
  let mockLivekitService: any;
  let msgDataReceived: Subject<any>;
  let messageEmitter: Subject<any>;

  beforeEach(async () => {
    msgDataReceived = new Subject<any>();
    messageEmitter = new Subject<any>();
    mockLivekitService = {
      localParticipantData: new Subject<any>(),
    };
    mockLivekitService = {
      messageEmitter: messageEmitter.asObservable(),
    };

    mockLivekitService = {
      msgDataReceived: msgDataReceived.asObservable(),
    };
    await TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatDialogModule, NoopAnimationsModule],
      declarations: [LiveKitRoomComponent],
      // providers: [
      //   { provide: LiveKitService, useValue: mockLiveKitService },
      //   { provide: MatDialog, useValue: mockMatDialog },
      //   { provide: MatSnackBar, useValue: mockMatSnackBar },
      // ],
      // providers: [LiveKitService, MatSnackBar],
      providers: [
        { provide: LiveKitService },
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
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
  it('should create the form with an empty message field', () => {
    expect(component.chatForm).toBeDefined();
    expect(component.chatForm.get('message')).toBeDefined();
    expect(component.chatForm.get('message')?.value).toBe('');
  });

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

  // it('should handle received message correctly', async () => {
  //   spyOn(console, 'log');
  //   spyOn(component, 'sortMessages');
  //   spyOn(component, 'scrollToBottom');

  //   const data = {
  //     message: 'Test message',
  //     timestamp: '2024-05-23T12:34:56Z',
  //   };

  //   messageEmitter.next(data); // Emit data

  //   expect(console.log).toHaveBeenCalledWith('data', data);
  //   expect(component.allMessages.length).toBe(1);
  //   expect(component.allMessages[0]).toEqual({
  //     sendMessage: 'Test message',
  //     sendingTime: '2024-05-23T12:34:56Z',
  //     type: 'sent',
  //   });
  //   expect(component.sortMessages).toHaveBeenCalled();
  //   expect(component.scrollToBottom).toHaveBeenCalled();
  // });
});
