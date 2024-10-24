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
