describe('Meeting Application E2E Tests', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6Ik5ldyBSb29tIiwiY2FuUHVibGlzaCI6dHJ1ZSwiY2FuU3Vic2NyaWJlIjp0cnVlfSwiaWF0IjoxNzE3NzY1MzI3LCJuYmYiOjE3MTc3NjUzMjcsImV4cCI6MTcxNzc4NjkyNywiaXNzIjoiQVBJbUZKWUNHTUx4OWJLIiwic3ViIjoiV2FyZGEgQXNpZiIsImp0aSI6IldhcmRhIEFzaWYifQ.VYfrrlLM0NgeC_nAoGClsfzs01revmPa-_n0x_Sjhj4';

  beforeEach(() => {
    // Replace with the URL of your application
    cy.visit('http://localhost:55308');
  });

  it('should display the meeting form when not started', () => {
    cy.get('[data-test="meetingForm"]').should('be.visible');
    cy.get('input[formControlName="token"]').should('be.visible');
    cy.get('button[type="submit"]').should('have.text', ' Start Meeting ');
  });

  it.only('should start a meeting with the given token', () => {
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
    cy.get('.left-header').should('be.visible');
    cy.get('.right-header').should('be.visible');
    cy.get('.chat-side-window-container').should('not.exist');
    cy.get('.participants-side-window-container').should('not.exist');

    // Click on the chat button to open the chat side window
    cy.get('button.chat').click();
    cy.get('.chat-side-window-container').should('be.visible');

    // Close the chat side window
    cy.get('.closeChatSideWindow').click();
    cy.get('.chat-side-window-container').should('not.exist');

    // Click on the participants button to open the participants side window
    cy.get('button.people').click();
    cy.get('.participants-side-window-container').should('be.visible');

    // Close the participants side window
    cy.get('.closeParticipantSideWindow').click();
    cy.get('.participants-side-window-container').should('not.exist');
  });

  it('should handle toggle buttons correctly', () => {
    // Enter the provided token and start the meeting
    cy.get('input[formControlName="token"]').type(token);
    cy.get('[data-cy="submit"]').click();

    // Verify and toggle video button
    cy.get('button.video i').should('have.class', 'fa-video');
    cy.get('button.video').click();
    cy.get('button.video i').should('have.class', 'fa-video-slash');

    // Verify and toggle mic button
    cy.get('button.mic i').should('have.class', 'fa-microphone-slash');
    cy.get('button.mic').click();
    cy.get('button.mic i').should('have.class', 'fa-microphone');
  });
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
    cy.get('.participants-side-window-container').should('be.visible');
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
