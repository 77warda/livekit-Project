import * as fromLivekitRoom from './livekit-room.reducer';
import { selectLivekitRoomState } from './livekit-room.selectors';

describe('LivekitRoom Selectors', () => {
  it('should select the feature state', () => {
    const result = selectLivekitRoomState({
      [fromLivekitRoom.livekitRoomFeatureKey]: {}
    });

    expect(result).toEqual({});
  });
});
