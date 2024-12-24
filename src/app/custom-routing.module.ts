import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LiveKitRoomComponent } from './live-kit-room/live-kit-room.component';

const routes: Routes = [
  { path: 'meeting/:roomName', component: LiveKitRoomComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class CustomRoutingModule {}
