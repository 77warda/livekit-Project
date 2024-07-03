import { Track } from 'livekit-client';
import { LiveKitService } from 'src/app/livekit.service';
describe('Meeting Application E2E Tests', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ik5ldyBSb29tIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzE4MTcyNjMzLCJuYmYiOjE3MTgxNzI2MzMsImV4cCI6MTcxODE5NDIzMywiaXNzIjoiQVBJbUZKWUNHTUx4OWJLIiwic3ViIjoiV2FyZGEgYXNpZiIsImp0aSI6IldhcmRhIGFzaWYifQ.H02tPGzupRDnrJKe1sZVmp1yqqV8B9l15Wl4n4mrW8M';
  beforeEach(() => {
    // Replace with the URL of your application
    cy.visit('http://localhost:4200');
  });

  it('should display the meeting form when not started', () => {
    cy.get('[data-test="meetingForm"]').should('be.visible');
    cy.get('input[formControlName="token"]').should('be.visible');
    cy.get('button[type="submit"]').should('have.text', ' Start Meeting ');
  });

  it('should display received and sent messages correctly', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.wait(3000);
    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');
    // Simulate receiving a message

    cy.wait(3000);
    cy.get('button.chat').click();
    const receivedMessage = {
      message: {
        message: 'Hello from another participant',
        timestamp: new Date().toLocaleTimeString(),
      },
      participant: {
        identity: 'Alice',
      },
    };

    cy.wait(3000);
    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');
    // Enter a chat message
    cy.get('input[formControlName="message"]').type(
      'Hello, this is a test message from local participant.'
    );

    // Click the send button
    cy.get('button.sendButton').click();

    // Send a message from the local participant
    // Verify that the message appears in the chat window
    cy.get('.main-sender').within(() => {
      cy.get('.msg-detail').should(
        'contain',
        'Hello, this is a test message from local participant.'
      );
    });
    cy.window().then((win) => {
      win.livekitService.msgDataReceived.next(receivedMessage);
    });

    cy.get('.main-receiver').within(() => {
      cy.get('.receiver-name').should('contain', 'Alice');
      cy.get('.msg-detail').should('contain', 'Hello from another participant');
    });

    // Simulate sending a message
    const sentMessage = {
      msg: 'Hello from me',
      recipient: '',
    };

    cy.window().then((win) => {
      win.livekitService.sendChatMessage(sentMessage);
    });

    cy.get('.main-sender').within(() => {
      cy.get('.msg-detail').should('contain', 'Hello from me');
    });
  });

  it('should display local and remote participants correctly', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.wait(3000);
    cy.get('button.people').click();
    cy.get('.participants-side-window-container').should('be.visible');
    // Simulate adding remote participants
    const remoteParticipants = [
      {
        identity: 'Alice',
        isCameraEnabled: true,
        isMicrophoneEnabled: false,
        handRaised: false,
      },
      {
        identity: 'Bob',
        isCameraEnabled: false,
        isMicrophoneEnabled: true,
        handRaised: true,
      },
    ];

    const localParticipant = {
      identity: 'LocalUser',
      isCameraEnabled: true,
      isMicrophoneEnabled: true,
      handRaised: false,
    };
    cy.wait(3000);
    cy.get('button.people').click();
    // cy.get('.participant-container').should('contain', '(You)');

    cy.window().then((win) => {
      win.livekitService.localParticipantData.next(localParticipant);
      win.livekitService.participantNamesUpdated.next(remoteParticipants);
    });

    // Verify local participant's details
    cy.get('.participant')
      .eq(0)
      .within(() => {
        cy.get('.name').should('contain', 'LocalUser(You)');
        cy.get('.fa-video').should('exist');
        cy.get('.fa-microphone-slash').should('exist');
        cy.get('.raised-hand-icon').should('not.exist');
      });

    // Verify Alice's details
    cy.get('.participant')
      .eq(1)
      .within(() => {
        cy.get('.name').should('contain', 'Alice');
        cy.get('.fa-video').should('exist');
        cy.get('.fa-microphone-slash').should('exist');
        cy.get('.raised-hand-icon').should('not.exist');
      });

    // Verify Bob's details
    cy.get('.participant')
      .eq(2)
      .within(() => {
        cy.get('.name').should('contain', 'Bob');
        cy.get('.fa-video-slash').should('exist');
        cy.get('.fa-microphone').should('exist');
        cy.get('.raised-hand-icon').should('exist');
      });
  });

  it.only('should toggle screen sharing correctly', () => {
    // Simulate login or access the application

    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.wait(3000); // Wait for the page to load

    // Verify initial state of screen sharing button
    cy.get('button.share').within(() => {
      cy.get('span.material-symbols-outlined').should(
        'contain',
        'screen_share'
      );
    });

    // Click the screen sharing button to start screen sharing
    cy.get('button.share').click();

    // Verify the button changes to stop screen sharing
    cy.get('button.share').within(() => {
      cy.get('span.material-symbols-outlined').should(
        'contain',
        'stop_screen_share'
      );
    });

    // Click the screen sharing button to stop screen sharing
    cy.get('button.share').click();

    // Verify the button changes back to start screen sharing
    cy.get('button.share').within(() => {
      cy.get('span.material-symbols-outlined').should(
        'contain',
        'screen_share'
      );
    });
  });

  it('should show an error dialog when camera access is denied from browser', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(
        new Error('Permission denied')
      );
    });
    cy.get('body').click(0, 0);

    // Verify that the error dialog disappears
    cy.get('.mat-dialog-container').should('not.exist');
    // Verify and toggle video button
    cy.get('button.video i').should('have.class', 'fa-video');
    cy.get('button.video').click({ force: true });
    cy.get('.mat-mdc-snack-bar-label').should('be.visible');

    cy.get('.mat-mdc-snack-bar-label')
      .should('be.visible')
      .and('contain', 'Error video start: Permission denied');

    // // Verify and toggle mic button
    cy.get('button.mic i').should('have.class', 'fa-microphone');
    cy.get('button.mic').click({ force: true });
  });

  it('should start a meeting with the given token', () => {
    // Check if the meeting form is visible
    cy.get('[data-test="meetingForm"]').should('be.visible');

    // Enter the provided token
    cy.get('input[formControlName="token"]').type(token);

    // Click the start meeting button
    cy.get('[data-cy="submit"]').click();

    // Verify that the meeting has started
    cy.get('[data-test="meetingForm"]').should('not.exist');
    // cy.wait(10000);
    cy.get('[data-test="meetingStarted"]').should('be.visible');
  });

  it('should display meeting controls when meeting is started', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // Verify that the meeting controls are visible
    cy.get('.left-header', { timeout: 10000 }).should('be.visible');
    cy.get('.right-header', { timeout: 10000 }).should('be.visible');
    cy.get('.chat-side-window-container').should('not.exist');
    cy.get('.participants-side-window-container').should('not.exist');

    // Click on the chat button to open the chat side window
    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');

    // Close the chat side window
    cy.get('.closeChatSideWindow').click({ force: true });
    cy.get('.chat-side-window-container').should('not.exist');

    // Click on the participants button to open the participants side window
    cy.get('button.people').click();
    cy.get('.participants-side-window-container').should('be.visible');

    // Close the participants side window
    cy.get('.closeParticipantSideWindow').click({ force: true });
    cy.get('.participants-side-window-container').should('not.exist');
  });

  // it.only('should handle toggle buttons correctly', () => {
  //   // Enter the provided token and start the meeting
  //   cy.get('input[formControlName="token"]').type(token);
  //   cy.get('[data-cy="submit"]').click();

  //   // Verify and toggle video button
  //   cy.get('button.video i').should('have.class', 'fa-video');
  //   cy.get('button.video').click();
  //   cy.get('button.video i').should('have.class', 'fa-video-slash');

  //   // Verify and toggle mic button
  //   cy.get('button.mic i').should('have.class', 'fa-microphone-slash');
  //   cy.get('button.mic').click();
  //   cy.get('button.mic i').should('have.class', 'fa-microphone');
  // });

  it('should display the meeting header when started', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // cy.get('[data-test="meetingStarted"]').should('be.visible');
    cy.get('header').should('be.visible');
    cy.get('button.grid-view').should('be.visible');
    cy.get('button.people').should('be.visible');
    cy.get('button.chat').should('be.visible');
    cy.get('button.emojis').should('be.visible');
    cy.get('button.more').should('be.visible');
    cy.get('button.video').should('be.visible');
    cy.get('button.mic').should('be.visible');
    cy.get('button.share').should('be.visible');
    cy.get('button.leave-btn').should('be.visible');
  });

  it('should open the chat side window', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');
  });
  it('should send a chat message', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');
    // Select "Everyone" from the dropdown
    cy.get('select[formControlName="participant"]').select('1');

    // Enter a chat message
    cy.get('input[formControlName="message"]').type(
      'Hello, this is a test message.'
    );

    // Click the send button
    cy.get('button.sendButton').click();

    // Verify that the message appears in the chat window
    cy.get('.os-content-body').should(
      'contain',
      'Hello, this is a test message.'
    );
  });

  it('should open the participant side window', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.get('button.people').click();
    cy.get('.participants-side-window-container', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  it('should display the local participant', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.get('button.people').click();
    cy.get('.participant-container').should('contain', '(You)');
  });

  it('should display the remote participants', () => {
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    cy.get('button.people').click();
    cy.get('.participant-container').should('have.length', 1); // assuming there is one remote participant
  });

  it('should raise and lower hand', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // Click on the raise hand button
    cy.contains('Raise Hand').click();
    cy.contains('Lower Hand').should('be.visible');

    // Click on the lower hand button
    cy.contains('Lower Hand').click();
    cy.contains('Raise Hand').should('be.visible');
  });

  it('should toggle screen share', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // Click on the screen share button
    cy.get('button.share').click();
    cy.get('span.material-symbols-outlined')
      .contains('stop_screen_share')
      .should('be.visible');

    // Click on the stop screen share button
    cy.get('button.share').click();
    cy.get('span.material-symbols-outlined')
      .contains('screen_share')
      .should('be.visible');
  });

  it('should leave the meeting', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // Click on the leave button
    cy.get('button.leave-btn').click();

    // Verify that the meeting form is visible again
    cy.get('[data-test="meetingForm"]').should('be.visible');
  });
});
