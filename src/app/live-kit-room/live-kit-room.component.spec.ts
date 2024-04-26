import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveKitRoomComponent } from './live-kit-room.component';

describe('LiveKitRoomComponent', () => {
  let component: LiveKitRoomComponent;
  let fixture: ComponentFixture<LiveKitRoomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiveKitRoomComponent]
    });
    fixture = TestBed.createComponent(LiveKitRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
