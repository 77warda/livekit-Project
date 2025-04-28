import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinRoomScreenComponent } from './join-room-screen.component';

describe('JoinRoomScreenComponent', () => {
  let component: JoinRoomScreenComponent;
  let fixture: ComponentFixture<JoinRoomScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinRoomScreenComponent]
    });
    fixture = TestBed.createComponent(JoinRoomScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
