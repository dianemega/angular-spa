import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFileUploaderModule } from 'angular-file-uploader';

import { UploadComponent } from './upload.component';
import { MaterialModule } from '../material.module';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadComponent],
      imports: [
        AngularFileUploaderModule,
        MaterialModule
      ],
      providers: []
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
