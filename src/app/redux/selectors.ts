import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LiveKitRoomState } from './reducer';

// Feature selector
export const selectLiveKitRoomState =
  createFeatureSelector<LiveKitRoomState>('liveKitRoom');

// Specific property selectors
export const selectIsMeetingStarted = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('hey this is ', state.isMeetingStarted);
    return state.isMeetingStarted;
  }
);

export const selectStream = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => {
    console.log('stream is ', state);
    return state.stream;
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
  (state: LiveKitRoomState) => state.unreadMessagesCount
);
export const selectIsVideoOn = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isVideoOn
);

export const selectIsMicOn = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isMicOn
);

export const selectIsScreenSharing = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.isScreenSharing
);

export const selectParticipantSideWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.participantSideWindowVisible
);

export const selectChatSideWindowVisible = createSelector(
  selectLiveKitRoomState,
  (state: LiveKitRoomState) => state.chatSideWindowVisible
);
