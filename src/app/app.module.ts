import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LiveKitRoomComponent } from './live-kit-room/live-kit-room.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LiveKitRoomEffects } from './redux/effect';
import { liveKitRoomReducer } from './redux/reducer';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VideoPlayerComponent } from './video-player/video-player.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MeetingNotesComponent } from './live-kit-room/meeting-notes/meeting-notes.component';
import { StartScreenComponent } from './live-kit-room/screens/start-screen/start-screen.component';
import { JoinRoomScreenComponent } from './live-kit-room/screens/join-room-screen/join-room-screen.component';

@NgModule({
  declarations: [
    AppComponent,
    LiveKitRoomComponent,
    ErrorDialogComponent,
    VideoPlayerComponent,
    MeetingNotesComponent,
    StartScreenComponent,
    JoinRoomScreenComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    StoreModule.forRoot({ liveKitRoom: liveKitRoomReducer }, {}),
    EffectsModule.forRoot([LiveKitRoomEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25 }),
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
