import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveKitRoomComponent } from './live-kit-room/live-kit-room.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

const routes: Routes = [
  { path: 'meeting/:roomname', component: LiveKitRoomComponent },
  { path: 'video-player', component: VideoPlayerComponent },
  { path: '**', redirectTo: '/meeting/default-room' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
