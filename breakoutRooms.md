# Meeting

## Breakout Rooms Implementation Plan

### Overview

Breakout Rooms allow participants in a main meeting room to be split into smaller groups for private discussions or activities. Each breakout room functions like an independent session with its own video, audio, and chat capabilities.

If we invite a group to a meeting, participants in that group won't automatically be available to distribute into breakout rooms. It is recommended to individually invite participants from a group to a meeting in order to easily distribute them into breakout rooms later.

### Key Features

#### 1.Isolation:

Breakout rooms provide a private space for group interaction without disrupting the main meeting.

#### 2.Flexibility:

Hosts can create multiple breakout rooms and assign participants manually or automatically.

#### 3.Control:

Hosts can move between rooms, broadcast messages to all rooms, and manage room settings.

#### 4.Efficiency:

Breakout rooms can enhance collaboration and participation by allowing smaller group discussions.

### Implementation

#### 1. UI Design and Layout

- **Breakout Rooms Button**: Add a button in the meeting controls to allow the host to create and manage breakout rooms.
- **Room List Panel**: Display a side panel listing all breakout rooms and participants within each room.
- **Participant UI**: Participants should have an interface to join their assigned breakout room and return to the main room.

#### 2. Managing Breakout Rooms

- **Create Breakout Rooms**:
  - On clicking the "Create Breakout Rooms" button, a modal should appear allowing the host to define the number of rooms and manually or automatically assign participants.
  - Implement logic to handle room creation and participant assignment.

#### 3. Switching Between Rooms

- **Room Transition**:

  - Implement services to handle the transition between the main meeting room and breakout rooms.
  - Use logics to join and leave rooms dynamically without disrupting the user's connection.

- **Room Notifications**:
  - Notify participants when they are moved to a breakout room and when it's time to return to the main room.
  - Provide real-time updates in the UI as participants move between rooms.

#### 4. Video and Audio Management

- **Independent Media Streams**:

  - Ensure that each breakout room has independent video and audio streams.
  - Use AngularJS directives to manage video and audio streams within each room context.

- **Screen Sharing and Chat**:
  - Implement functionality for screen sharing and chat within breakout rooms, ensuring isolation from the main room.
  - UI elements should adapt dynamically when a participant enters or leaves a breakout room.

#### 5. User Experience Enhancements

- **Room Timer**:

  - Allow hosts to set timers for breakout sessions, with visual indicators for participants.
  - Provide countdown notifications before automatically returning participants to the main room.

- **Participant Controls**:
  - Participants should have easy access to controls for muting/unmuting and turning video on/off within the breakout room.
  - Implement UI feedback to indicate when the participant is in a breakout room versus the main room.

### Conclusion

The implementation of Breakout Rooms in the LiveKit video conference system will enhance the meeting experience by enabling smaller group discussions.

#### 6. Implementing Different steps and Testing Breakout Rooms in the Browser

1. **Create a "Breakout Rooms" Button in the Header**

   - **Browser Action**: Add a button labeled "Breakout Rooms" to the header or main control panel of your video conferencing interface.
   - **Expected Outcome**: This button will allow the host or participants to access the breakout room controls.

2. **Click the "Breakout Rooms" Button**

   - **Browser Action**: Click the "Breakout Rooms" button.
   - **Expected Outcome**: A side panel should open, displaying options to create, join, or manage breakout rooms.

3. **Create Breakout Rooms**

   - **Browser Action**: In the opened side panel, click on "Create Breakout Rooms".
   - **Expected Outcome**: A form should appear where you can specify the number of rooms, assign names, and set parameters like time limits for the sessions.

4. **Assign Participants to Breakout Rooms**

   - **Browser Action**: After creating the rooms, add participants into the different breakout rooms using a user-friendly interface.
   - **Expected Outcome**: You should see the participants being assigned to different rooms, with the interface updating to reflect these changes.

5. **Start the Breakout Sessions**

   - **Browser Action**: Click a "Start Breakout Sessions" button or confirm your room assignments.
   - **Expected Outcome**: Participants should be automatically moved into their assigned breakout rooms, and their video streams should transition to the new room.

6. **Monitor or Join Breakout Rooms**

   - **Browser Action**: As a host, select a breakout room from the interface to monitor or join the session.
   - **Expected Outcome**: The host should be able to enter any breakout room, with their video and audio seamlessly switching to that room.

7. **Set a Timer for Breakout Sessions**

   - **Browser Action**: In the breakout room management panel, set a timer for the session duration.
   - **Expected Outcome**: A countdown timer should be visible to participants, and notifications should be sent when time is running out or the session is about to end.

8. **End Breakout Sessions and Return to Main Room**

   - **Browser Action**: Click an "End Breakout Sessions" button when the session is complete or the timer runs out.
   - **Expected Outcome**: All participants should be automatically moved back to the main room, and their video streams should reflect this transition.

9. **Provide Feedback or Notifications**

   - **Browser Action**: Ensure that participants receive notifications or alerts during key transitions, such as moving to a breakout room, session ending, or returning to the main room.

      <!-- ==================new flow for breakout room===============  -->

## Create Breakout Room in the Header

### Browser Action:

The host can create a breakout room by selecting the option available in the header section of the interface.

### Expected Outcome:

A popup window appears for the host to manage the breakout room setup.

## Host Creates a Breakout Room and Invites Participants

### Browser Action:

After creating the breakout room, the host will see a popup to add participants.

### Expected Outcome:

The host can assign participants to the breakout room using the popup interface.

## Participant Receives Notification to Join Breakout Room

### Browser Action:

Participants will receive a popup notification with an invitation to join the breakout room.

### Expected Outcome:

The popup should appear on each participant's screen, prompting them to join the breakout room.

## Participants Join Breakout Room

### Browser Action:

Participants can click to accept the invitation in the popup to join the breakout room.

### Expected Outcome:

Upon acceptance, participants are automatically moved into the breakout room and their video and audio transition to the new room.
