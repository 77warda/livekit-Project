import {
  selectLiveKitRoomState,
  selectIsMeetingStarted,
  selectIsVideoOn,
  selectParticipantSideWindowVisible,
  selectChatSideWindowVisible,
  selectIsScreenSharing,
  selectIconColor,
  selectIsMicOn,
  selectAllMessages,
  selectUnreadMessagesCount,
  selectBreakoutSideWindowVisible,
  isBreakoutModalOpen,
  isInvitationModalOpen,
  isHostMsgModalOpen,
  selectDistributionMessage,
  selectBreakoutRoomsData,
  selectNextRoomIndex,
  selectHelpMessageModal,
  selectBreakoutRoomsLoading,
  selectGetRoomName,
  selectLiveKitRoomViewState,
} from './selectors';
import { LiveKitRoomState } from './reducer';

describe('LiveKit Room Selectors', () => {
  let mockState: LiveKitRoomState;

  beforeEach(() => {
    mockState = {
      isMeetingStarted: true,
      allMessages: ['Hello', 'World'],
      unreadMessagesCount: 2,
      isVideoOn: true,
      isMicOn: false,
      isScreenSharing: false,
      iconColor: 'red',
      participantSideWindowVisible: true,
      breakoutSideWindowVisible: false,
      chatSideWindowVisible: true,
      error: null, // Changed from undefined to null to match the LiveKitRoomState
      token: null,
      isBreakoutModalOpen: false,
      isInvitationModalOpen: true,
      isHostMsgModalOpen: false,
      roomType: 'standard',
      selectedParticipants: [],
      numberOfRooms: null,
      distributionMessage: 'Welcome to the meeting!',
      breakoutRoomsData: [
        {
          roomName: 'Room A',
          participantIds: ['user1'],
          showAvailableParticipants: true,
        },
      ],
      nextRoomIndex: 1,
      helpMessageModal: false,
      loading: false, // Add this field to match the initial state
      roomName: 'Main Room', // Add this field to match the initial state
    };
  });

  it('should select the liveKitRoom feature state', () => {
    const result = selectLiveKitRoomState.projector(mockState);
    expect(result).toEqual(mockState);
  });
  //   describe('selectIsMeetingStarted', () => {
  //     it('should return the value of isMeetingStarted from the state', () => {
  //       // Mock LiveKitRoomState with isMeetingStarted set to true
  //       const mockState: LiveKitRoomState = {
  //         isMeetingStarted: true, // Test with true
  //         // Add other properties as necessary
  //       };

  //       // Call the selector with the mock state
  //       const result = selectIsMeetingStarted.projector(mockState);

  //       // Assertion: Expect the selector to return true
  //       expect(result).toBe(true);

  //       // Now test with isMeetingStarted set to false
  //       mockState.isMeetingStarted = false;
  //       const resultFalse = selectIsMeetingStarted.projector(mockState);

  //       // Assertion: Expect the selector to return false
  //       expect(resultFalse).toBe(false);
  //     });
  //   });

  it('should select isMeetingStarted', () => {
    const result = selectIsMeetingStarted.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isVideoOn', () => {
    const result = selectIsVideoOn.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select participantSideWindowVisible', () => {
    const result = selectParticipantSideWindowVisible.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select chatSideWindowVisible', () => {
    const result = selectChatSideWindowVisible.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isScreenSharing', () => {
    const result = selectIsScreenSharing.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select iconColor', () => {
    const result = selectIconColor.projector(mockState);
    expect(result).toBe('red');
  });

  it('should select isMicOn', () => {
    const result = selectIsMicOn.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select allMessages', () => {
    const result = selectAllMessages.projector(mockState);
    expect(result).toEqual(['Hello', 'World']);
  });

  it('should select unreadMessagesCount', () => {
    const result = selectUnreadMessagesCount.projector(mockState);
    expect(result).toBe(2);
  });

  it('should select breakoutSideWindowVisible', () => {
    const result = selectBreakoutSideWindowVisible.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select isBreakoutModalOpen', () => {
    const result = isBreakoutModalOpen.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select isInvitationModalOpen', () => {
    const result = isInvitationModalOpen.projector(mockState);
    expect(result).toBe(true);
  });

  it('should select isHostMsgModalOpen', () => {
    const result = isHostMsgModalOpen.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select distributionMessage', () => {
    const result = selectDistributionMessage.projector(mockState);
    expect(result).toBe('Welcome to the meeting!');
  });

  it('should select breakoutRoomsData', () => {
    const result = selectBreakoutRoomsData.projector(mockState);
    expect(result).toEqual([
      {
        roomName: 'Room A',
        participantIds: ['user1'],
        showAvailableParticipants: true,
      },
    ]);
  });

  it('should select nextRoomIndex', () => {
    const result = selectNextRoomIndex.projector(mockState);
    expect(result).toBe(1);
  });

  it('should select helpMessageModal', () => {
    const result = selectHelpMessageModal.projector(mockState);
    expect(result).toBe(false);
  });
  it('should select breakoutRoomsLoading', () => {
    const result = selectBreakoutRoomsLoading.projector(mockState);
    expect(result).toBe(false);
  });

  it('should select roomName', () => {
    const result = selectGetRoomName.projector(mockState);
    expect(result).toBe('Main Room');
  });

  it('should select the aggregated LiveKitRoomViewState', () => {
    const result = selectLiveKitRoomViewState.projector(
      mockState.isMeetingStarted,
      mockState.isVideoOn,
      mockState.participantSideWindowVisible,
      mockState.chatSideWindowVisible,
      mockState.isScreenSharing,
      mockState.iconColor,
      mockState.isMicOn,
      mockState.allMessages,
      mockState.unreadMessagesCount,
      mockState.breakoutSideWindowVisible,
      mockState.isBreakoutModalOpen,
      mockState.isInvitationModalOpen,
      mockState.isHostMsgModalOpen,
      mockState.distributionMessage,
      mockState.breakoutRoomsData,
      mockState.nextRoomIndex,
      mockState.helpMessageModal,
      mockState.loading,
      mockState.roomName
    );

    expect(result).toEqual({
      isMeetingStarted: true,
      isVideoOn: true,
      participantSideWindowVisible: true,
      chatSideWindowVisible: true,
      isScreenSharing: false,
      iconColor: 'red',
      isMicOn: false,
      allMessages: ['Hello', 'World'],
      unreadMessagesCount: 2,
      breakoutSideWindowVisible: false,
      isBreakoutModalOpen: false,
      isInvitationModalOpen: true,
      isHostMsgModalOpen: false,
      distributionMessage: 'Welcome to the meeting!',
      breakoutRoomsData: [
        {
          roomName: 'Room A',
          participantIds: ['user1'],
          showAvailableParticipants: true,
        },
      ],
      nextRoomIndex: 1,
      helpMessageModal: false,
      breakoutRoomsLoading: false,
      getRoomName: 'Main Room',
    });
  });
});
