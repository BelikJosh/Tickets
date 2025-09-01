import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoUploadComponent } from './photo-upload';

describe('Empleado', () => {
  let component:  PhotoUploadComponent;
  let fixture: ComponentFixture< PhotoUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PhotoUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent( PhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
