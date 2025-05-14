import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { BackgroundProcessor } from '@livekit/track-processors';

@Component({
  selector: 'app-blur-video',
  templateUrl: './blur-video.component.html',
  styleUrls: ['./blur-video.component.scss'],
})
export class BlurVideoComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true })
  videoElement!: ElementRef<HTMLVideoElement>;

  private originalTrack!: LocalVideoTrack;
  private processedTrack!: LocalVideoTrack;
  private processor: any;

  async ngOnInit(): Promise<void> {
    // Step 1: Create the original camera track
    this.originalTrack = await createLocalVideoTrack();

    // Step 2: Create the background processor (blur is the default effect)
    this.processor = BackgroundProcessor({
      blurRadius: 10, // Optional: adjust the strength of the blur
    });

    // Step 3: Load the ML model
    await this.processor.loadModel();

    // Step 4: Apply blur to the video track
    this.processedTrack = await this.processor.apply(this.originalTrack);

    // Step 5: Attach the processed track to the DOM
    const videoEl = this.processedTrack.attach();
    this.videoElement.nativeElement.replaceWith(videoEl);
  }

  ngOnDestroy(): void {
    if (this.processedTrack) {
      this.processedTrack.stop();
      this.processedTrack.detach().forEach((el) => el.remove());
    }

    if (this.originalTrack) {
      this.originalTrack.stop();
    }

    if (this.processor) {
      this.processor.destroy();
    }
  }
}
