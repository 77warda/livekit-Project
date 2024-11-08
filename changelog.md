# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2024-10-22

### Added

- **Unit Testing**

  - Implemented unit tests for Livekit component and services using Karma and Jasmine.

- **Breakout Rooms**
  - Integrated breakout room functionality in the LiveKit video conferencing project.
  - Added logic for users to join and leave breakout rooms.
  - Implemented dynamic room creation based on user input.

### Changed

- **Unit Testing**

  - Refactored tests for better coverage and maintainability.
  - Enhanced test cases for edge scenarios in the meeting management module.

- **Breakout Rooms**
  - Updated room management UI to display active breakout rooms and participant lists.
  - Enhanced user experience by adding Proper names instead of Ids for room transitions.
  - Implement the functionality to assign an unallocated participant (someone who is late or not assigned a breakout room) to either an existing room or a new room,

### Fixed

- **Unit Testing**

  - Resolved issues with mocking dependencies in the test cases.
  - Fixed broken tests in the video stream handling module.

- **Breakout Rooms**
  - Fixed issue with breakout rooms not closing properly after the host leaves.
  - Change the name of the breakout room and use underscores instead of spaces.
  - Added a form to write name before entering into the room.
  - Fixed issue with participants not being updated in the breakout room list.
  - Fixed issue with breakout room not being updated when a participant joins or leaves.
  - If it’s existing room, then participant will be added in that room otherwise will move to the new room.

## [Changelog for this Week]

[1.2.0] - 2024-11-04

### Added

- Conducted research on Picture-in-Picture functionality for use in the video conference project.
- Started implementing the PiP window in the video conference project.

### Changed

- Began researching Picture-in-Picture features in the context of NgRx meetings.

### Fixed

- No significant fixes on this day.

[1.2.1] - 2024-11-05

### Added

- Utilized the **document PictureInPicture API** to implement the LiveKit overlay functionality.
- Implemented functionality for PiP to trigger automatically when the user switches tabs.

### Changed

- Studied the documentation and code samples to understand how the **document PictureInPicture API** works.

### Fixed

- Integrated the PiP API into LiveKit, allowing the entire video conference UI to be displayed in the PiP overlay.

[1.2.2] - 2024-11-06

### Added

- Worked on the PiP window and resolved issues with dynamic HTML creation in the service.
- Ensured participant data is reflected in the DOM correctly after participants join or leave the meeting.

### Fixed

- Fixed the header in the PiP window to make it work properly with dynamic content.
- Updated participant tiles so they refresh correctly when participants join or leave the meeting.

[1.2.3] - 2024-11-07

### Added

- Implemented functionality to trigger PiP mode automatically upon the `visibilitychange` event.

### Changed

- Focused on fixing the video conference header interactivity within the PiP overlay, which is now working correctly. Only icons need further adjustments.

### Fixed

- Fixed issues with the video conference header not being interactive in the PiP overlay.

[1.2.4] - 2024-11-08

### Added

- Completed an Exercism exercise on If/Else-If logic and different array methods and classes in javascript.
- Added documentation for the changes and updated the changelog file with this week's progress.

### Fixed

- Fixed the PiP overlay icons to correctly reflect the state of the microphone, raise hand, and other features in LiveKit.
