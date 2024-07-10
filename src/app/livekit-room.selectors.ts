import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromLivekitRoom from './livekit-room.reducer';

export const selectLivekitRoomState = createFeatureSelector<fromLivekitRoom.State>(
  fromLivekitRoom.livekitRoomFeatureKey
);
