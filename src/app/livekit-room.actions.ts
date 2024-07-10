import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const LivekitRoomActions = createActionGroup({
  source: 'LivekitRoom',
  events: {
    'Load LivekitRooms': emptyProps(),
    'Load LivekitRooms Success': props<{ data: unknown }>(),
    'Load LivekitRooms Failure': props<{ error: unknown }>(),
  }
});
