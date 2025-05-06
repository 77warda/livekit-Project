import { Component, OnInit, OnDestroy } from '@angular/core';
// import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
// import { BackgroundBlur } from '@livekit/track-processors';

@Component({
  selector: 'app-blur-video',
  templateUrl: './blur-video.component.html',
  styleUrls: ['./blur-video.component.scss'],
})
export class BlurVideoComponent {
  // videoTrack?: LocalVideoTrack;
  // blurProcessor: any;
  // async ngOnInit() {
  //   try {
  //     // Create video track
  //     this.videoTrack = await createLocalVideoTrack();
  //     // Apply background blur
  //     this.blurProcessor = BackgroundBlur(10);
  //     await this.videoTrack.setProcessor(this.blurProcessor);
  //     // Attach to DOM
  //     const videoEl = this.videoTrack.attach();
  //     videoEl.style.width = '100%';
  //     videoEl.style.height = 'auto';
  //     document.getElementById('video-container')?.appendChild(videoEl);
  //   } catch (error) {
  //     console.error('Background blur not supported or failed to apply:', error);
  //   }
  // }
  // async ngOnDestroy() {
  //   try {
  //     await this.videoTrack?.stopProcessor();
  //     this.videoTrack?.detach();
  //     this.videoTrack?.stop();
  //   } catch (err) {
  //     console.error('Error cleaning up:', err);
  //   }
  // }
  // async updateBlur(radius: number) {
  //   if (this.blurProcessor) {
  //     await this.blurProcessor.updateTransformerOptions({ blurRadius: radius });
  //   }
  // }
  // async disableBlur() {
  //   try {
  //     await this.videoTrack?.stopProcessor();
  //   } catch (err) {
  //     console.error('Failed to disable blur:', err);
  //   }
  // }
}
