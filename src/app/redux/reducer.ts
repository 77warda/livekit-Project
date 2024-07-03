import { createReducer, on } from '@ngrx/store';
import * as LiveKitRoomActions from './actions';
import { RemoteTrack } from 'livekit-client';

export interface LiveKitRoomState {
  isMeetingStarted: boolean;
  stream?: MediaStream;
  allMessages: any[];
  unreadMessagesCount: number;
  isVideoOn: boolean;
  isMicOn: boolean;
  isScreenSharing: boolean;
  participantSideWindowVisible: boolean;
  chatSideWindowVisible: boolean;
  error?: string;
}

export const initialState: LiveKitRoomState = {
  isMeetingStarted: false,
  allMessages: [],
  unreadMessagesCount: 0,
  isVideoOn: false,
  isMicOn: false,
  isScreenSharing: false,
  participantSideWindowVisible: false,
  chatSideWindowVisible: false,
};

export const liveKitRoomReducer = createReducer(
  initialState,
  on(LiveKitRoomActions.startMeetingSuccess, (state) => ({
    ...state,
    isMeetingStarted: true,
  })),
  on(LiveKitRoomActions.startMeetingFailure, (state, { error }) => ({
    ...state,
    isMeetingStarted: false,
    error,
  })),
  on(LiveKitRoomActions.enableCameraAndMicrophoneSuccess, (state) => ({
    ...state,
  })),
  on(
    LiveKitRoomActions.enableCameraAndMicrophoneFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  ),
  on(LiveKitRoomActions.startCameraSuccess, (state, { stream }) => ({
    ...state,
    stream,
  })),
  on(LiveKitRoomActions.startCameraFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(
    LiveKitRoomActions.toggleScreenShareSuccess,
    (state, { isScreenSharing }) => ({
      ...state,
      isScreenSharing,
    })
  ),
  on(LiveKitRoomActions.toggleScreenShareFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.toggleVideoSuccess, (state, { isVideoOn }) => ({
    ...state,
    isVideoOn,
  })),
  on(LiveKitRoomActions.toggleVideoFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.toggleMicSuccess, (state, { isMicOn }) => ({
    ...state,
    isMicOn,
  })),
  on(LiveKitRoomActions.toggleMicFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(LiveKitRoomActions.openParticipantSideWindow, (state) => ({
    ...state,
    participantSideWindowVisible: true,
    chatSideWindowVisible: false,
  })),
  on(LiveKitRoomActions.closeParticipantSideWindow, (state) => ({
    ...state,
    participantSideWindowVisible: false,
  })),
  on(LiveKitRoomActions.openChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: true,
    participantSideWindowVisible: false,
    unreadMessagesCount: 0,
  })),
  on(LiveKitRoomActions.closeChatSideWindow, (state) => ({
    ...state,
    chatSideWindowVisible: false,
  })),
  on(LiveKitRoomActions.updateUnreadMessagesCount, (state, { count }) => ({
    ...state,
    unreadMessagesCount: count,
  })),
  on(LiveKitRoomActions.updateMessages, (state, { allMessages }) => ({
    ...state,
    allMessages,
  }))
);
