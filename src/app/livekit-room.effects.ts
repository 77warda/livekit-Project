import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { LivekitRoomActions } from './livekit-room.actions';


@Injectable()
export class LivekitRoomEffects {

  loadLivekitRooms$ = createEffect(() => {
    return this.actions$.pipe(

      ofType(LivekitRoomActions.loadLivekitRooms),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map(data => LivekitRoomActions.loadLivekitRoomsSuccess({ data })),
          catchError(error => of(LivekitRoomActions.loadLivekitRoomsFailure({ error }))))
      )
    );
  });


  constructor(private actions$: Actions) {}
}
