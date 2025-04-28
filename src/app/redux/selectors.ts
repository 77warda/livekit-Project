import { createSelector, createFeatureSelector } from '@ngrx/store';
import { BreakoutRoom, LiveKitRoomState } from './reducer';

// Feature selector
export const selectLiveKitRoomState =
  createFeatureSelector<LiveKitRoomState>('liveKitRoom');

export const selectIsInitialScreenStarted = createSelector(
  selectLiveKitRoomState,
  (state) => {
    console.log('selector screen', state.isInitialScreenStarted);
    return state.isInitialScreenStarted;
  }
);
// Specific property selectors
export const selectIsMeetingStarted = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('Meeting started is ', state.isMeetingStarted);
    return state.isMeetingStarted;
  }
);

export const selectIsVideoOn = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isVideoOn
);

export const selectParticipantSideWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.participantSideWindowVisible
);

export const selectChatSideWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.chatSideWindowVisible
);

export const selectIsScreenSharing = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isScreenSharing
);

export const selectIconColor = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.iconColor
);

export const selectIsMicOn = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('selector mic', state.isMicOn);
    return state.isMicOn;
  }
);

export const selectAllMessages = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('msg is ', state.allMessages);
    return state.allMessages;
  }
);

export const selectUnreadMessagesCount = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('selector unreads', state.unreadMessagesCount);
    return state.unreadMessagesCount;
  }
);

export const selectBreakoutSideWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.breakoutSideWindowVisible
);

export const isBreakoutModalOpen = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    return state.isBreakoutModalOpen;
  }
);
export const isInvitationModalOpen = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    return state.isInvitationModalOpen;
  }
);

export const isHostMsgModalOpen = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('hello invitation', state.isHostMsgModalOpen);
    return state.isHostMsgModalOpen;
  }
);
export const selectDistributionMessage = createSelector(
  selectLiveKitRoomState,
  (state) => state.distributionMessage
);
export const selectBreakoutRoomsData = createSelector(
  selectLiveKitRoomState,
  (state) => {
    console.log('br from selector', state.breakoutRoomsData);
    return state.breakoutRoomsData;
  }
);
export const selectNextRoomIndex = createSelector(
  selectLiveKitRoomState,
  (state) => state.nextRoomIndex
);

export const selectHelpMessageModal = createSelector(
  selectLiveKitRoomState,
  (state) => {
    console.log('helpmessage ', state.helpMessageModal);
    return state.helpMessageModal;
  }
);
export const selectBreakoutRoomsLoading = createSelector(
  selectLiveKitRoomState,
  (state) => {
    console.log('loading rooms ', state.loading);
    return state.loading;
  }
);

export const selectGetRoomName = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.roomName
);

export const selectIsVideoLoading = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isVideoLoading
);

export const selectIsMicLoading = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isMicLoading
);

export const selectPreviewVideo = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isPreviewVideoOn
);

export const selectPreviewMic = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isPreviewMicOn
);

export const selectParticipantIds = createSelector(
  selectBreakoutRoomsData,
  (breakoutRooms: BreakoutRoom[]) => {
    if (!breakoutRooms) {
      return [];
    }
    console.log(
      'selector p-Ids',
      breakoutRooms.reduce((ids, room) => [...ids, ...room.participantIds], [])
    );
    // Flatten the participantIds arrays from all rooms into a single array
    return breakoutRooms.reduce(
      (ids, room) => [...ids, ...room.participantIds],
      []
    );
  }
);
export const selectNotesWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.notesWindowVisible
);

export const selectLiveKitRoomViewState = createSelector(
  selectIsInitialScreenStarted,
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
  selectIsVideoLoading,
  selectIsMicLoading,
  selectParticipantIds,
  selectPreviewVideo,
  selectPreviewMic,
  selectNotesWindowVisible,
  (
    isInitialScreenStarted,
    isMeetingStarted,
    isVideoOn,
    participantSideWindowVisible,
    chatSideWindowVisible,
    isScreenSharing,
    iconColor,
    isMicOn,
    allMessages,
    unreadMessagesCount,
    breakoutSideWindowVisible,
    isBreakoutModalOpen,
    isInvitationModalOpen,
    isHostMsgModalOpen,
    distributionMessage,
    breakoutRoomsData,
    nextRoomIndex,
    helpMessageModal,
    breakoutRoomsLoading,
    getRoomName,
    isVideoLoading,
    isMicLoading,
    participantIds,
    isPreviewVideoOn,
    isPreviewMicOn,
    notesWindowVisible
  ) => ({
    isInitialScreenStarted,
    isMeetingStarted,
    isVideoOn,
    participantSideWindowVisible,
    chatSideWindowVisible,
    isScreenSharing,
    iconColor,
    isMicOn,
    allMessages,
    unreadMessagesCount,
    breakoutSideWindowVisible,
    isBreakoutModalOpen,
    isInvitationModalOpen,
    isHostMsgModalOpen,
    distributionMessage,
    breakoutRoomsData,
    nextRoomIndex,
    helpMessageModal,
    breakoutRoomsLoading,
    getRoomName,
    isVideoLoading,
    isMicLoading,
    participantIds,
    isPreviewVideoOn,
    isPreviewMicOn,
    notesWindowVisible,
  })
);
