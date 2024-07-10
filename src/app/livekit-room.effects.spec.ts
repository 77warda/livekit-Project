import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { LivekitRoomEffects } from './livekit-room.effects';

describe('LivekitRoomEffects', () => {
  let actions$: Observable<any>;
  let effects: LivekitRoomEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LivekitRoomEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(LivekitRoomEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
