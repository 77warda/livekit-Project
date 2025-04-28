import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LiveKitService } from 'src/app/livekit.service';
import { selectLiveKitRoomViewState } from 'src/app/redux/selectors';
import * as LiveKitRoomActions from '../../../redux/actions';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-join-room-screen',
  templateUrl: './join-room-screen.component.html',
  styleUrls: ['./join-room-screen.component.scss'],
})
export class JoinRoomScreenComponent {
  @Output() meetingReady: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild('videoElement', { static: false })
  videoElement!: ElementRef<HTMLVideoElement>;
  videoStream: MediaStream | null = null;

  liveKitViewState$!: Observable<any>;
  participantName: string = '';
  dynamicRoomName = '';
  isSpeaking: boolean = false;
  isMicOn = false;
  isVideoOn = false;
  recognition: any;

  isMicDropdownOpen = false; // To toggle mic dropdown visibility
  isVideoDropdownOpen = false; // To toggle video dropdown visibility

  selectedVideoId: string | null = null;
  selectedMicId: string | null = null;
  selectedSpeakerId: string | null = null;

  videoDevices: MediaDeviceInfo[] = [];
  micDevices: MediaDeviceInfo[] = [];
  speakerDevices: MediaDeviceInfo[] = [];

  audioDevicesLoaded = false;
  videoDevicesLoaded = false;

  // isInitialMeetingStarted: boolean = false;

  constructor(
    private livekitService: LiveKitService,
    public store: Store,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.liveKitViewState$ = this.store.pipe(
      select(selectLiveKitRoomViewState)
    );

    this.livekitService.deviceLists$.subscribe((devices) => {
      console.log('Devices received:', devices);
      this.videoDevices = devices.videoDevices;
      this.micDevices = devices.micDevices;
      this.speakerDevices = devices.speakerDevices;
    });

    this.livekitService.updateDeviceLists();
    // Fetch all devices initially
    try {
      const devices = await this.livekitService.getAllDevices();

      // Populate the devices lists
      this.videoDevices = devices.cameras;
      this.micDevices = devices.microphones;
      this.speakerDevices = devices.speakers;

      // Select the first device from each category by default
      if (this.videoDevices.length > 0) {
        this.selectedVideoId = this.videoDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'videoinput',
          this.selectedVideoId
        );
      }

      if (this.micDevices.length > 0) {
        this.selectedMicId = this.micDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'audioinput',
          this.selectedMicId
        );
      }

      if (this.speakerDevices.length > 0) {
        this.selectedSpeakerId = this.speakerDevices[0].deviceId;
        await this.livekitService.switchDevice(
          'audiooutput',
          this.selectedSpeakerId
        );
      }

      console.log('Default devices selected:');
      console.log('Video:', this.selectedVideoId);
      console.log('Mic:', this.selectedMicId);
      console.log('Speaker:', this.selectedSpeakerId);
    } catch (error) {
      console.error('Error initializing default devices:', error);
    }

    this.route.params.subscribe((params) => {
      console.log('Route params:', params);
      this.dynamicRoomName = params['roomname'];

      // Dispatch the action after updating dynamicRoomName
      this.store.dispatch(
        LiveKitRoomActions.MeetingActions.setRoomName({
          roomName: this.dynamicRoomName,
        })
      );
    });

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      // Detect when speech starts and results are coming in
      this.recognition.onresult = (event: any) => {
        console.log('Speech detected.');
        this.isSpeaking = true; // Show the span while speaking

        // Reset isSpeaking to false after a delay if speech stops
        clearTimeout((this as any).speechTimeout); // Clear previous timeout
        (this as any).speechTimeout = setTimeout(() => {
          this.isSpeaking = false; // Hide span after no speech detected
        }, 1000); // Adjust the timeout as needed
      };

      // Handle speech recognition errors
      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        this.isSpeaking = false; // Ensure span is hidden on errors
      };

      // Handle the end of recognition session
      this.recognition.onend = () => {
        console.log('Speech recognition stopped.');
        this.isSpeaking = false; // Hide span when recognition stops
      };
    } else {
      console.error('Speech Recognition API is not supported in this browser.');
    }
    setTimeout(() => {
      this.meetingReady.emit(true);
    }, 500);
  }
  async startMeeting() {
    console.log(`Current roomName: ${this.dynamicRoomName}`);
    if (this.dynamicRoomName) {
      console.log(`Current roomName: ${this.dynamicRoomName}`);
      this.store.dispatch(
        LiveKitRoomActions.MeetingActions.createMeeting({
          participantNames: [this.participantName],
          roomName: this.dynamicRoomName, // Use the roomName dynamically
        })
      );
      console.log(`Starting meeting in room: ${this.dynamicRoomName}`);
      this.store.dispatch(
        LiveKitRoomActions.BreakoutActions.loadBreakoutRooms()
      );
      await this.livekitService.applySelectedDevices();
    } else {
      console.error('Cannot start meeting: Room name is undefined!');
    }
  }

  togglePreviewMic(): void {
    try {
      this.livekitService.toggleMicrophone().subscribe(
        (isMicOn) => {
          this.isMicOn = isMicOn;
          console.log('Video turned on by default:', isMicOn);
        },
        (error) => {
          console.error('Error enabling video by default:', error);
        }
      );
      if (!this.isMicOn) {
        // Start speech recognition
        this.recognition.start();
        console.log('Microphone turned on.');
      } else {
        // Stop speech recognition
        this.recognition.stop();
        console.log('Microphone turned off.');
        this.isSpeaking = false; // Ensure span is hidden when mic is turned off
      }

      this.isMicOn = !this.isMicOn;
      this.store.dispatch(
        LiveKitRoomActions.LiveKitActions.previewMicEnable({
          isPreviewMic: this.isMicOn,
        })
      );
      this.liveKitViewState$.subscribe((mic) => {
        mic.isMicOn = this.isMicOn;
      });
    } catch (error) {
      console.error('Error toggling Mic:', error);
    }
  }

  async toggleCamera() {
    try {
      if (this.isVideoOn) {
        // Turn off the camera
        this.stopVideoStream();
      } else {
        // Turn on the camera
        await this.startVideoStream();
      }
      this.livekitService.toggleVideo().subscribe(
        (isVideoOn) => {
          this.isVideoOn = isVideoOn;
          console.log('Video turned on by default:', isVideoOn);
        },
        (error) => {
          console.error('Error enabling video by default:', error);
        }
      );
      this.isVideoOn = !this.isVideoOn;
      this.store.dispatch(
        LiveKitRoomActions.LiveKitActions.previewCameraEnable({
          isPreviewVideo: this.isVideoOn,
        })
      );
      this.liveKitViewState$.subscribe((video) => {
        video.isVideoOn = this.isVideoOn;
      });
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  }

  async startVideoStream() {
    try {
      // Request video access
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      console.log('Video element:', this.videoElement);
      console.log('Video stream:', this.videoStream);

      if (this.videoElement && this.videoStream) {
        const video = this.videoElement.nativeElement;

        // Attach stream to video element
        video.srcObject = this.videoStream;

        // Ensure video starts playing
        await video.play();
        console.log('Video is playing');
      } else {
        console.warn('Video element or stream is not available');
      }
    } catch (error) {
      console.error('Error accessing video stream:', error);
    }
  }

  stopVideoStream() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }

    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      video.srcObject = null; // Detach stream
    }
  }
  async toggleVideoDropdown() {
    if (!this.videoDevicesLoaded) {
      try {
        this.videoDevices = await this.livekitService.getDevices('videoinput');
        this.videoDevicesLoaded = true; // Mark as loaded
        console.log('Video devices loaded:', this.videoDevices);
      } catch (error) {
        console.error('Error fetching video devices:', error);
      }
    }
    this.isVideoDropdownOpen = !this.isVideoDropdownOpen;
  }
  async toggleMicDropdown() {
    if (!this.audioDevicesLoaded) {
      try {
        const devices = await this.livekitService.getAllDevices();
        this.micDevices = devices.microphones;
        this.speakerDevices = devices.speakers;
        this.audioDevicesLoaded = true; // Mark as loaded
        console.log(
          'Audio devices loaded:',
          this.micDevices,
          this.speakerDevices
        );
      } catch (error) {
        console.error('Error fetching audio devices:', error);
      }
    }
    this.isMicDropdownOpen = !this.isMicDropdownOpen;
  }

  async selectVideo(deviceId: string) {
    this.selectedVideoId = deviceId;
    await this.livekitService.switchDevice('videoinput', deviceId);
    console.log('Selected video device:', deviceId);
  }

  async selectMic(deviceId: string) {
    this.selectedMicId = deviceId;
    await this.livekitService.switchDevice('audioinput', deviceId);
    console.log('Selected microphone device:', deviceId);
  }

  async selectSpeaker(deviceId: string) {
    this.selectedSpeakerId = deviceId;
    await this.livekitService.switchDevice('audiooutput', deviceId);
    console.log('Selected speaker device:', deviceId);
  }
}
