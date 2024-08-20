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
