import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlurVideoComponent } from './blur-video.component';

describe('BlurVideoComponent', () => {
  let component: BlurVideoComponent;
  let fixture: ComponentFixture<BlurVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BlurVideoComponent]
    });
    fixture = TestBed.createComponent(BlurVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
