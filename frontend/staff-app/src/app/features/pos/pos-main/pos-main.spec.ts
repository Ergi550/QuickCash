import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosMain } from './pos-main';

describe('PosMain', () => {
  let component: PosMain;
  let fixture: ComponentFixture<PosMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosMain]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosMain);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
