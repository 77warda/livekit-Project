import { createFeature, createReducer, on } from '@ngrx/store';
import { LivekitRoomActions } from './livekit-room.actions';

export const livekitRoomFeatureKey = 'livekitRoom';

export interface State {

}

export const initialState: State = {

};

export const reducer = createReducer(
  initialState,
  on(LivekitRoomActions.loadLivekitRooms, state => state),
  on(LivekitRoomActions.loadLivekitRoomsSuccess, (state, action) => state),
  on(LivekitRoomActions.loadLivekitRoomsFailure, (state, action) => state),
);

export const livekitRoomFeature = createFeature({
  name: livekitRoomFeatureKey,
  reducer,
});

