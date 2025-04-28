import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss'],
})
export class StartScreenComponent {
  @Output() startMeetingClicked = new EventEmitter<void>();

  onInitialStartMeeting() {
    this.startMeetingClicked.emit();
  }
}
