import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
} from 'livekit-client';
import { LiveKitService } from '../livekit.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import {
  selectAllMessages,
  selectChatSideWindowVisible,
  selectIconColor,
  selectIsMeetingStarted,
  selectIsMicOn,
  selectIsScreenSharing,
  selectIsVideoOn,
  selectParticipantSideWindowVisible,
  selectUnreadMessagesCount,
} from '../redux/selectors';
import * as LiveKitRoomActions from '../redux/actions';

const GRIDCOLUMN: { [key: number]: string } = {
  1: '1fr',
  2: '1fr 1fr',
  3: '1fr 1fr',
  4: '1fr 1fr',
  5: '1fr 1fr 1fr',
  6: '1fr 1fr 1fr',
};
@Component({
  selector: 'app-live-kit-room',
  templateUrl: './live-kit-room.component.html',
  styleUrls: ['./live-kit-room.component.scss'],
})
export class LiveKitRoomComponent {
  // websocket variables
  webSocketStatus: 'connected' | 'reconnecting' | 'disconnected' =
    'disconnected';
  private statusSubscription!: Subscription;
  // selectors
  isMeetingStarted$!: Observable<boolean>;
  allMessages$!: Observable<any[]>;
  unreadMessagesCount$!: Observable<number>;
  isVideoOn$!: Observable<boolean>;
  isMicOn$!: Observable<boolean>;
  participantSideWindowVisible$!: Observable<boolean>;
  chatSideWindowVisible$!: Observable<boolean>;
  isScreenSharing$!: Observable<boolean>;
  iconColor$!: Observable<string>;
  iconColor = 'black';

  // private subscriptions: Subscription[] = [];
  @ViewChild('messageContainer') messageContainer!: ElementRef | any;
  attachedTrack: HTMLElement | null = null;
  startForm!: FormGroup;
  chatForm!: FormGroup;
  screenShareTrackSubscription!: Subscription;
  screenShareTrack!: RemoteTrack | undefined;
  unreadMessagesCount = 0;
  remoteParticipantNames: any;
  localParticipant: any;
  handRaiseStates: { [identity: string]: boolean } = {};
  allMessages: any[] = [];
  room!: Room;

  constructor(
    private formBuilder: FormBuilder,
    public livekitService: LiveKitService,
    private snackBar: MatSnackBar,
    private store: Store
  ) {}

  ngOnInit() {
    // this.livekitService.connectWebSocket();
    this.livekitService.audioVideoHandler();
    this.isMeetingStarted$ = this.store.pipe(select(selectIsMeetingStarted));
    this.isScreenSharing$ = this.store.pipe(select(selectIsScreenSharing));

    this.iconColor$ = this.store.pipe(select(selectIconColor));
    this.isVideoOn$ = this.store.pipe(select(selectIsVideoOn));
    this.participantSideWindowVisible$ = this.store.pipe(
      select(selectParticipantSideWindowVisible)
    );
    this.chatSideWindowVisible$ = this.store.pipe(
      select(selectChatSideWindowVisible)
    );
    this.allMessages$ = this.store.pipe(select(selectAllMessages));
    this.unreadMessagesCount$ = this.store.pipe(
      select(selectUnreadMessagesCount)
    );
    this.isMicOn$ = this.store.pipe(select(selectIsMicOn));
    // web socket
    this.statusSubscription = this.livekitService.webSocketStatus$.subscribe(
      (status) => {
        this.webSocketStatus = status;
        console.log('WebSocket status updated:', status); // Log the current WebSocket status
      }
    );
    // Call startMeeting in ngOnInit
    this.startMeeting();
    // ==============================
    this.startForm = this.formBuilder.group({
      token: [''],
    });
    this.chatForm = this.formBuilder.group({
      message: [''],
      participant: [''],
    });
    this.chatSideWindowVisible$.subscribe((visible) => {
      if (visible) {
        this.unreadMessagesCount = 0;
        this.scrollToBottom();
      }
    });
    this.livekitService.msgDataReceived.subscribe((data) => {
      // console.log('Received message:', data.message.handRaised);

      console.log('Participant:', data.participant);
      if (data.message.handRaised === true) {
        // console.log(`${data.participant} raised its hand`);
        if (data.participant) {
          this.handRaiseStates[data.participant.identity] = true;
          this.openSnackBar(`${data.participant.identity} raised its hand`);
        }
      }
      if (data.message.handRaised === false) {
        // console.log(`${data.participant} lowered its hand`);
        if (data.participant) {
          this.handRaiseStates[data.participant.identity] = false;
          this.openSnackBar(`${data.participant.identity} lowered its hand`);
        }
      }
      if (data.message.type !== 'handRaise') {
        const receivedMsg = data?.message?.message;
        const senderName = data?.participant?.identity;
        const receivingTime = data?.message?.timestamp;
        this.allMessages.push({
          senderName,
          receivedMsg,
          receivingTime,
          type: 'received',
        });
        this.chatSideWindowVisible$.subscribe((visible) => {
          if (!visible) {
            this.unreadMessagesCount++;
            this.scrollToBottom();
          }
        });

        this.scrollToBottom();
        this.sortMessages();
      }
    });
    this.livekitService.messageEmitter.subscribe((data: any) => {
      console.log('data', data);
      const sendMessage = data?.message;
      const sendingTime = data?.timestamp;
      this.allMessages.push({ sendMessage, sendingTime, type: 'sent' });
      this.sortMessages();
      this.scrollToBottom();
    });

    this.attachedTrack = this.livekitService.attachTrackToElement(
      Track,
      'remoteVideoContainer'
    );
    this.livekitService.participantNamesUpdated.subscribe((names: any) => {
      this.remoteParticipantNames = names;
      console.log('Participant names updated:', this.remoteParticipantNames);
    });

    this.livekitService.localParticipantData.subscribe((data: any) => {
      this.localParticipant = data;
      // this.localParticipant = data.find((p: any) => p.isLocal);
      console.log('local Participant name updated:', this.localParticipant);
    });
    if ((window as any).Cypress) {
      (window as any).livekitService = this.livekitService;
    }
  }

  /**
   * Initiates the start of a meeting by dispatching a `startMeeting` action
   * with the WebSocket URL and a dynamic token obtained from the form value.
   *
   * This function:
   * 1. Retrieves the token from the form value.
   * 2. Logs the token to the console.
   * 3. Defines the WebSocket URL.
   * 4. Dispatches the `startMeeting` action with the WebSocket URL and token.
   *
   * @async
   * @function
   * @returns {Promise<void>} - A promise that resolves when the meeting has been initiated.
   */
  async startMeeting() {
    const dynamicToken = this.startForm.value.token;
    console.log('token is', dynamicToken);
    const wsURL = 'wss://warda-ldb690y8.livekit.cloud';
    const token = dynamicToken;
    this.store.dispatch(LiveKitRoomActions.startMeeting({ wsURL, token }));
  }

  /**
   * Extracts the initials from a given name by taking the first character of each word.
   *
   * This function:
   * 1. Splits the name into words.
   * 2. Maps each word to its first character.
   * 3. Joins the characters to form the initials.
   *
   * @param {any} name - The name from which to extract initials.
   * @returns {string} - The initials derived from the name.
   */
  extractInitials(name: any) {
    const words = name.split(' ').map((word: any) => word.charAt(0));
    return words.join('');
  }

  /**
   * Sorts the `allMessages` array in ascending order based on the message's timestamp.
   *
   * This function:
   * 1. Sorts messages by their `receivingTime` or `sendingTime` in ascending order.
   * 2. Modifies the `allMessages` array in place.
   *
   * @function
   * @returns {void}
   */
  sortMessages() {
    this.allMessages.sort(
      (a, b) =>
        new Date(a.receivingTime || a.sendingTime).getTime() -
        new Date(b.receivingTime || b.sendingTime).getTime()
    );
  }

  /**
   * Determines whether the avatar should be shown for a message at a given index.
   *
   * This function:
   * 1. Always shows the avatar for the first message.
   * 2. Shows the avatar if the sender of the current message is different from the sender of the previous message.
   *
   * @param {number} index - The index of the message in the `allMessages` array.
   * @returns {boolean} - `true` if the avatar should be shown, otherwise `false`.
   */

  shouldShowAvatar(index: number): boolean {
    if (index === 0) {
      return true;
    }
    const currentMessage = this.allMessages[index];
    const previousMessage = this.allMessages[index - 1];
    return currentMessage.senderName !== previousMessage.senderName;
  }

  /**
   * Sends a chat message using the LiveKit service and resets the chat form.
   *
   * This function:
   * 1. Retrieves the message and recipient from the chat form.
   * 2. Calls the `sendChatMessage` method of the LiveKit service with the message and recipient.
   * 3. Resets the chat form.
   *
   * @function
   * @returns {void}
   */
  sendMessage() {
    const msg = this.chatForm.value.message;
    const recipient = this.chatForm.value.participant;
    this.livekitService.sendChatMessage({ msg, recipient });

    this.chatForm.reset();
  }

  /**
   * Toggles the raise hand status of the local participant.
   *
   * This function:
   * 1. Checks the current hand raise status of the local participant.
   * 2. If the hand is raised, calls the `lowerHand` method of the LiveKit service.
   * 3. If the hand is not raised, calls the `raiseHand` method of the LiveKit service.
   *
   * @function
   * @returns {void}
   */

  toggleRaiseHand() {
    if (this.localParticipant.handRaised) {
      this.localParticipant.handRaised = false;
      this.livekitService.lowerHand(this.localParticipant);
      this.openSnackBar(`${this.localParticipant.identity} lowered hand`);
      this.handRaiseStates[this.localParticipant.identity] = false;
    } else {
      this.localParticipant.handRaised = true;
      this.livekitService.raiseHand(this.localParticipant);
      this.openSnackBar(`${this.localParticipant.identity} raised hand`);
      this.handRaiseStates[this.localParticipant.identity] = true;
    }
  }

  ngAfterViewInit(): void {
    this.screenShareTrackSubscription =
      this.livekitService.screenShareTrackSubscribed.subscribe(
        (track: RemoteTrack | undefined) => {
          // this.screenShareTrack = track.source === Track.Source.ScreenShare;
          // console.log('check condition', this.screenShareTrack);
          if (track && track.source === Track.Source.ScreenShare) {
            this.screenShareTrack = track;
            console.log('ss track', track);
          } else {
            this.screenShareTrack = undefined; // Reset to null if no screen share track
            console.log('else ss track', this.screenShareTrack);
          }
        }
      );
    this.livekitService.remoteVideoTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );
    this.livekitService.remoteAudioTrackSubscribed.subscribe(
      (
        track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        this.livekitService.handleTrackSubscribed(
          track,
          publication,
          participant
        );
      }
    );
  }

  /**
   * Dispatches an action to leave the meeting.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async leaveBtn(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.leaveMeeting());
  }

  /**
   * Dispatches an action to toggle screen sharing.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleScreenShare(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleScreenShare());
  }

  /**
   * Dispatches an action to toggle video.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleVideo(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleVideo());
  }

  /**
   * Dispatches an action to toggle the microphone.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  async toggleMic(): Promise<void> {
    this.store.dispatch(LiveKitRoomActions.toggleMic());
  }

  /**
   * Dispatches an action to toggle the participant side window.
   *
   * @function
   * @returns {void}
   */
  openParticipantSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.toggleParticipantSideWindow());
  }

  /**
   * Dispatches an action to toggle the chat side window.
   * Resets the unread messages count and scrolls to the bottom if the chat window is visible.
   *
   * @function
   * @returns {void}
   */
  openChatSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.toggleChatSideWindow());
    // this.chatSideWindowVisible$.subscribe((visible) => {
    //   if (visible) {
    //     this.unreadMessagesCount = 0;
    //     this.scrollToBottom();
    //   }
    // });
  }

  /**
   * Dispatches an action to close the chat side window.
   *
   * @function
   * @returns {void}
   */
  closeChatSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.closeChatSideWindow());
  }

  /**
   * Dispatches an action to close the participant side window.
   *
   * @function
   * @returns {void}
   */
  closeParticipantSideWindow(): void {
    this.store.dispatch(LiveKitRoomActions.closeParticipantSideWindow());
  }

  /**
   * Returns the CSS grid column style based on the number of participants in the LiveKit room.
   * If the number of participants is 6 or fewer, returns a predefined grid column style.
   * If the number of participants is more than 6, returns a default grid column style.
   *
   * @readonly
   * @type {string}
   */
  get GalleryGridColumnStyle() {
    if (this.livekitService.room.numParticipants <= 6) {
      return GRIDCOLUMN[this.livekitService.room.numParticipants];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }

  /**
   * Scrolls the message container to the bottom.
   * Uses a timeout to ensure the scroll action occurs after the view has updated.
   *
   * @function
   * @returns {void}
   */
  scrollToBottom(): void {
    try {
      setTimeout(() => {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }, 100);
    } catch (err) {}
  }

  /**
   * Opens a snack bar with a given message.
   * The snack bar includes a 'Close' action and automatically dismisses after 3 seconds.
   *
   * @param {string} message - The message to display in the snack bar.
   * @function
   * @returns {void}
   */
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // duration in milliseconds
    });
  }
  get ScreenGalleryGridColumnStyle() {
    if (this.livekitService.screenShareCount <= 6) {
      return GRIDCOLUMN[this.livekitService.screenShareCount];
    } else {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
  }
}
