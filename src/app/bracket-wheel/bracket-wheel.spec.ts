import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BracketWheel } from './bracket-wheel';

describe('BracketWheel', () => {
  let component: BracketWheel;
  let fixture: ComponentFixture<BracketWheel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BracketWheel],
    }).compileComponents();

    fixture = TestBed.createComponent(BracketWheel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
