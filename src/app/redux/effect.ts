import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { LiveKitService } from '../livekit.service';
import * as LiveKitRoomActions from './actions';
import {
  catchError,
  concatMap,
  filter,
  map,
  mergeMap,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { of, from, forkJoin, EMPTY } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MeetingService } from '../Meeting-Service/meeting.service';
import {
  selectBreakoutRoomsData,
  selectGetRoomName,
  selectLiveKitRoomViewState,
  selectParticipantIds,
  selectPreviewMic,
  selectPreviewVideo,
} from './selectors';
import { Store } from '@ngrx/store';
import { BreakoutRoomService } from '../breakout-room-service/breakout-room.service';
import { ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LiveKitRoomEffects {
  participanIds = [];
  constructor(
    private actions$: Actions,
    private livekitService: LiveKitService,
    private meetingService: MeetingService,
    private snackBar: MatSnackBar,
    private store: Store,
    private breakoutRoomService: BreakoutRoomService,
    private activatedRoute: ActivatedRoute
  ) {}

  createMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.createMeeting),
      mergeMap((action) => {
        const participantObservables = action.participantNames.map(
          (participantName) =>
            this.meetingService
              .createMeeting(participantName, action.roomName)
              .pipe(map((response) => response.token))
        );

        // Use forkJoin directly on participantObservables
        return forkJoin(participantObservables).pipe(
          map((tokens) => {
            return LiveKitRoomActions.LiveKitActions.startMeeting({
              wsURL: 'wss://hassam-app-fu1y3ybu.livekit.cloud',
              token: tokens[0], // Use the first token
            });
          }),
          catchError((error) =>
            of(
              LiveKitRoomActions.MeetingActions.createMeetingFailure({ error })
            )
          )
        );
      })
    )
  );

  startMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.startMeeting),
      mergeMap((action) =>
        from(
          this.livekitService.connectToRoom(action.wsURL, action.token)
        ).pipe(
          tap(() => console.log('Starting meeting with token:', action.token)),
          map(() => LiveKitRoomActions.LiveKitActions.startMeetingSuccess()),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.startMeetingFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  toggleScreenShare$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleScreenShare),
      mergeMap(() =>
        from(this.livekitService.toggleScreenShare()).pipe(
          tap((isScreenSharing) =>
            console.log('Effect: Result from service', isScreenSharing)
          ),
          map((isScreenSharing: boolean) =>
            LiveKitRoomActions.LiveKitActions.toggleScreenShareSuccess({
              isScreenSharing,
            })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.toggleScreenShareFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  leaveMeeting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.leaveMeeting),
      switchMap(() =>
        this.livekitService.disconnectRoom().pipe(
          map(() => {
            this.snackBar.open('You Left the meeting', '', { duration: 2000 });
            return LiveKitRoomActions.MeetingActions.leaveMeetingSuccess();
          }),
          catchError((error) =>
            of(
              LiveKitRoomActions.MeetingActions.leaveMeetingFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );
  sendChatMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(LiveKitRoomActions.ChatActions.sendChatMessage),
        switchMap(({ msg, recipient }) => {
          // Call the LiveKit service to send the message
          this.livekitService.sendChatMessage({ msg, recipient });
          return []; // No further actions to dispatch
        })
      ),
    { dispatch: false } // No action is dispatched after this effect
  );
  //send message to breakout room
  sendMessageToBreakoutRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoom),
      mergeMap((action) =>
        this.livekitService
          .sendMessageToBreakoutRoom(action.breakoutRoom, action.messageContent)
          .pipe(
            map(() =>
              LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomSuccess()
            ),
            catchError((error) =>
              of(
                LiveKitRoomActions.ChatActions.sendMessageToBreakoutRoomFailure(
                  { error }
                )
              )
            )
          )
      )
    )
  );
  sendHelpRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.ChatActions.sendHelpRequest),
      mergeMap((action) =>
        this.livekitService
          .sendMessageToMainRoom(action.roomName, 'I need help')
          .pipe(
            map(() => LiveKitRoomActions.ChatActions.sendHelpRequestSuccess()),
            catchError((error) =>
              of(
                LiveKitRoomActions.ChatActions.sendHelpRequestFailure({ error })
              )
            )
          )
      )
    )
  );

  initiateManualRoomSelection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.sendBreakoutRoomsInvitation),
      concatLatestFrom(() => this.store.select(selectBreakoutRoomsData)),
      mergeMap(([action, viewState]) => {
        console.log('sendBreakoutRoomsInvitation action received');
        try {
          console.log('Manual room selection initiated');
          console.log('Rooms data:', viewState);

          // Process each room and send invitations
          viewState.forEach((room) => {
            const { roomName, participantIds } = room;

            if (participantIds && participantIds.length > 0) {
              console.log(`Sending invitations to room: ${roomName}`);
              this.livekitService.breakoutRoomAlert(participantIds, roomName);
            } else {
              console.log(`No participants in room: ${roomName}`);
            }
          });

          // Dispatch success action
          return of(
            LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationSuccess({
              message: 'Invitations sent successfully',
            })
          );
        } catch (error) {
          console.error('Error during manual room selection:', error);

          // Dispatch failure action
          return of(
            LiveKitRoomActions.BreakoutActions.breakoutRoomsInvitationFailure({
              error: 'Failed to send invitations',
            })
          );
        }
      })
    )
  );

  createAutomaticRooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.initiateAutomaticRoomCreation),
      concatLatestFrom(() => this.store.select(selectGetRoomName)), // Get roomName from store
      switchMap(([{ participants, numberOfRooms }, roomName]) => {
        // Step 1: Split participants into rooms
        const rooms = this.splitParticipantsIntoRooms(
          participants,
          numberOfRooms
        );

        // Step 2: Prepare breakout room data
        const breakoutRoomsData = rooms.map((roomParticipants, index) => ({
          participantIds: roomParticipants,
          roomName: `${roomName} Room ${index + 1}`, // Dynamically use roomName from store
          type: 'automatic',
        }));

        // Step 3: Send breakout room alerts and add participants
        const addParticipantActions = breakoutRoomsData.flatMap((room) =>
          room.participantIds.map((participantId) => {
            // Send invitation (side effect)
            this.livekitService.breakoutRoomAlert(
              [participantId],
              room.roomName
            );

            // Dispatch action to add participant to the room
            return LiveKitRoomActions.BreakoutActions.addParticipantToRoom({
              roomName: room.roomName,
              participantId,
            });
          })
        );

        // Step 4: Dispatch all `addParticipantToRoom` actions
        return of(...addParticipantActions);
      })
    )
  );

  // Utility function to split participants into rooms

  splitParticipantsIntoRooms(participants: string[], numberOfRooms: number) {
    const rooms: string[][] = Array.from({ length: numberOfRooms }, () => []);
    participants.forEach((participant, index) => {
      const roomIndex = index % numberOfRooms;
      rooms[roomIndex].push(participant);
    });
    return rooms;
  }

  loadBreakoutRooms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.loadBreakoutRooms), // Action to trigger breakout rooms loading
      concatLatestFrom(() => this.store.select(selectGetRoomName)), // Get latest roomName from store
      switchMap(([action, roomName]) => {
        console.log('Room name from effect:', roomName); // Log the room name

        return this.breakoutRoomService.getAllBreakoutRooms(roomName).pipe(
          map((rooms) =>
            LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsSuccess({
              breakoutRoomsData: rooms,
            })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.BreakoutActions.loadBreakoutRoomsFailure({
                error: error.message,
              })
            )
          )
        );
      })
    )
  );

  previewVideo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.setRoomName),
      concatLatestFrom(() => [this.store.select(selectPreviewVideo)]),
      filter(([action, previewVideo]) => previewVideo),
      map(() => LiveKitRoomActions.LiveKitActions.toggleVideo())
    )
  );
  toggleVideo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleVideo),
      switchMap(() =>
        this.livekitService.toggleVideo().pipe(
          map((isVideoOn: boolean) =>
            LiveKitRoomActions.LiveKitActions.toggleVideoSuccess({ isVideoOn })
          ),
          catchError((error) =>
            of(
              LiveKitRoomActions.LiveKitActions.toggleVideoFailure({
                error: error.message,
              })
            )
          )
        )
      )
    )
  );

  previewMic$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.MeetingActions.setRoomName),
      concatLatestFrom(() => [this.store.select(selectPreviewMic)]),
      tap((previewMic) => console.log('mic prev', previewMic)),
      filter(([action, isPreviewMic]) => isPreviewMic),
      map(() => LiveKitRoomActions.LiveKitActions.toggleMic())
    )
  );

  toggleMicrophone$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.LiveKitActions.toggleMic),
      switchMap(() =>
        from(this.livekitService.toggleMicrophone()).pipe(
          tap((isMicOn) => console.log('microphone in effects', isMicOn)),
          map((isMicOn: any) =>
            LiveKitRoomActions.LiveKitActions.toggleMicSuccess({ isMicOn })
          ),
          catchError((error) =>
            from([
              LiveKitRoomActions.LiveKitActions.toggleMicFailure({ error }),
            ])
          )
        )
      )
    )
  );

  // createNewRoom$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(LiveKitRoomActions.BreakoutActions.createNewRoom),
  //     concatLatestFrom(() => [
  //       this.store.select(selectGetRoomName),
  //       this.store.select(selectBreakoutRoomsData),
  //     ]),
  //     switchMap(([_, roomName, breakoutRoomsData]) => {
  //       const roomCount = breakoutRoomsData.length + 1;
  //       const newRoomName = `${roomName} Room ${roomCount}`;

  //       return this.breakoutRoomService
  //         .createBreakoutRoom({
  //           roomName: newRoomName,
  //           participantIds: [],
  //           showAvailableParticipants: true,
  //         })
  //         .pipe(
  //           map((newRoom) =>
  //             LiveKitRoomActions.BreakoutActions.createNewRoomSuccess({
  //               newRoom, // Pass the newly created room data to success action
  //             })
  //           ),
  //           catchError((error) =>
  //             of(
  //               LiveKitRoomActions.BreakoutActions.createNewRoomFailure({
  //                 error, // Pass the error to failure action
  //               })
  //             )
  //           )
  //         );
  //     })
  //   )
  // );

  createNewRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.createNewRoom),
      concatLatestFrom(() => [
        this.store.select(selectGetRoomName),
        this.store.select(selectBreakoutRoomsData),
      ]),
      switchMap(([_, roomName, breakoutRoomsData]) => {
        const roomCount = breakoutRoomsData.length + 1;
        const newRoomName = `${roomName} Room ${roomCount}`;

        // Dynamically extract participantIds for the new room
        // const room = breakoutRoomsData.find((r) => r.roomName === roomName);

        // console.log('Dynamically fetched room:', room);
        breakoutRoomsData.forEach((room) => {
          const { roomName, participantIds } = room;

          console.log(`p -ids: ${participantIds}`);
          this.participanIds = participantIds;
        });
        console.log('Dynamically fetched participant IDs:', breakoutRoomsData);

        return this.breakoutRoomService
          .createBreakoutRoom({
            roomName: newRoomName,
            participantIds: this.participanIds, // Dynamically fetched IDs
            showAvailableParticipants: true, // Ensure this property is always included
          })
          .pipe(
            map((newRoom) =>
              LiveKitRoomActions.BreakoutActions.createNewRoomSuccess({
                newRoom: {
                  ...newRoom,
                  roomName: newRoom.roomName, // Ensure roomName is set
                  participantIds: newRoom.participantIds, // Ensure participantIds is set
                  showAvailableParticipants:
                    newRoom.showAvailableParticipants ?? true, // Default to `true` if undefined
                },
              })
            ),
            catchError((error) =>
              of(
                LiveKitRoomActions.BreakoutActions.createNewRoomFailure({
                  error,
                })
              )
            )
          );
      })
    )
  );

  // recreateRoom$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(LiveKitRoomActions.BreakoutActions.recreateRoom),
  //     concatLatestFrom(() => [
  //       this.store.select(selectBreakoutRoomsData),
  //       this.store.select(selectGetRoomName),
  //     ]),
  //     switchMap(([action, breakoutRoomsData, roomName]) => {
  //       const { roomId } = action; // `roomId` to delete is passed with the action
  //       const roomToRecreate = breakoutRoomsData.find(
  //         (room) => room.id === roomId
  //       );

  //       if (!roomToRecreate) {
  //         return of(
  //           LiveKitRoomActions.BreakoutActions.recreateRoomFailure({
  //             error: `Room with ID ${roomId} not found`,
  //           })
  //         );
  //       }

  //       const updatedRoomName = `${roomName} Room ${
  //         breakoutRoomsData.length + 1
  //       }`;

  //       return this.breakoutRoomService
  //         .deleteBreakoutRoom(roomId, roomName)
  //         .pipe(
  //           switchMap(() =>
  //             this.breakoutRoomService.createBreakoutRoom({
  //               roomName: updatedRoomName,
  //               participantIds: roomToRecreate.participantIds,
  //               showAvailableParticipants: true,
  //             })
  //           ),
  //           map((newRoom) =>
  //             LiveKitRoomActions.BreakoutActions.recreateRoomSuccess({
  //               newRoom,
  //             })
  //           ),
  //           catchError((error) =>
  //             of(
  //               LiveKitRoomActions.BreakoutActions.recreateRoomFailure({
  //                 error,
  //               })
  //             )
  //           )
  //         );
  //     })
  //   )
  // );

  recreateRoom$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LiveKitRoomActions.BreakoutActions.recreateRoom), // Triggered by `recreateRoom` action
      concatLatestFrom(() => [
        this.store.select(selectBreakoutRoomsData),
        this.store.select(selectGetRoomName), // Get roomName from store
      ]),
      switchMap(([action, breakoutRoomsData, roomName]) => {
        const { roomId } = action; // Extract room ID from the action

        const roomToDelete = breakoutRoomsData.find(
          (room) => room.id === roomId
        );

        if (!roomToDelete) {
          // If the room is not found, dispatch a failure action
          return of(
            LiveKitRoomActions.BreakoutActions.recreateRoomFailure({
              error: `Room with ID ${roomId} not found`,
            })
          );
        }

        // Call the service to delete the room, passing both `roomId` and `roomName`
        return this.breakoutRoomService
          .deleteBreakoutRoom(roomId, roomName)
          .pipe(
            map(() =>
              // Use `recreateRoomSuccess` to indicate the room was successfully deleted
              LiveKitRoomActions.BreakoutActions.recreateRoomSuccess({
                newRoom: roomToDelete, // Optionally, return the deleted room details
              })
            ),
            catchError((error) =>
              of(
                LiveKitRoomActions.BreakoutActions.recreateRoomFailure({
                  error,
                })
              )
            )
          );
      })
    )
  );
}
