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
} from './selectors';
import { LiveKitRoomState } from './reducer';

describe('LiveKit Room Selectors', () => {
  const mockState: LiveKitRoomState = {
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
    token: null,
    isBreakoutModalOpen: false,
    isInvitationModalOpen: true,
    isHostMsgModalOpen: false,
    roomType: 'standard',
    selectedParticipants: ['user1', 'user2'],
    numberOfRooms: 3,
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
  };

  it('should select the liveKitRoom feature state', () => {
    const result = selectLiveKitRoomState.projector(mockState);
    expect(result).toEqual(mockState);
  });

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
});
