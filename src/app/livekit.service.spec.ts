import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { LiveKitService } from './livekit.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { LocalParticipant, Room } from 'livekit-client';

describe('LivekitService', () => {
  TestBed.configureTestingModule({
    providers: [LiveKitService],
  });
  let service: LiveKitService;
  let roomMock: jasmine.SpyObj<Room>;

  beforeEach(() => {
    roomMock = jasmine.createSpyObj('Room', ['connect']);
    TestBed.configureTestingModule({
      imports: [MatSnackBarModule, MatDialogModule, NoopAnimationsModule],
      providers: [LiveKitService, { provide: Room, useValue: roomMock }],
    });
    service = TestBed.inject(LiveKitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // it('should connect to room', async () => {
  //   const wsURL = 'wss://vc-ua59wquz.livekit.cloud';
  //   const token =
  //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ik5ldyBSb29tIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzE2NTUyNDQ5LCJuYmYiOjE3MTY1NTI0NDksImV4cCI6MTcxNjU3NDA0OSwiaXNzIjoiQVBJVVdiRUs3Qmd2NHVrIiwic3ViIjoiQWlzaGEiLCJqdGkiOiJBaXNoYSJ9.eDb6arjJXSYeivuGaQwrVI1H4pX0DI200pyimrrDs6U';
  //   roomMock.connect.and.returnValue(Promise.resolve());

  //   await service.connectToRoom(wsURL, token);
  //   expect(roomMock.connect).toHaveBeenCalledWith(wsURL, token);
  // });
});
