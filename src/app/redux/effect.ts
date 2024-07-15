import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { LiveKitService } from '../livekit.service';
import * as LiveKitRoomActions from './actions';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';

@Injectable()
export class LiveKitRoomEffects {
  constructor(
    private actions$: Actions,
    private livekitService: LiveKitService
  ) {}

  startMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.startMeeting),
      mergeMap((action) =>
        from(
          this.livekitService.connectToRoom(action.wsURL, action.token)
        ).pipe(
          tap(() => console.log('Starting meet', action)),
          map(() => LiveKitRoomActions.startMeetingSuccess()),
          catchError((error) =>
            of(LiveKitRoomActions.startMeetingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  toggleScreenShare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.toggleScreenShare),
      mergeMap(() =>
        from(this.livekitService.toggleScreenShare()).pipe(
          map((isScreenSharing: any) =>
            LiveKitRoomActions.toggleScreenShareSuccess({ isScreenSharing })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.toggleScreenShareFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  enableCameraAndMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.enableCameraAndMicrophone),
      mergeMap(() =>
        from(this.livekitService.enableCameraAndMicrophone()).pipe(
          map(() => LiveKitRoomActions.enableCameraAndMicrophoneSuccess()),
          catchError((error) =>
            of(
              LiveKitRoomActions.enableCameraAndMicrophoneFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  startCamera$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.startCamera),
      mergeMap(() =>
        from(this.livekitService.startCamera()).pipe(
          map((stream) => {
            if (stream) {
              return LiveKitRoomActions.startCameraSuccess({ stream });
            } else {
              throw new Error('Camera start failed: no stream returned');
            }
          }),
          catchError((error) =>
            of(LiveKitRoomActions.startCameraFailure({ error: error.message }))
          )
        )
      )
    )
  );

  toggleMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.toggleMic),
      mergeMap(() =>
        from(this.livekitService.toggleMicrophone()).pipe(
          map((isMicOn: any) =>
            LiveKitRoomActions.toggleMicSuccess({ isMicOn })
          ),
          catchError((error) =>
            from([LiveKitRoomActions.toggleMicFailure({ error })])
          )
        )
      )
    )
  );
}
