import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KNOCKOUT_MATCHES } from '../knockout-data';
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

  it('does not render country codes below flags', () => {
    fixture.detectChanges();

    const countryCodes = new Set(
      KNOCKOUT_MATCHES.flatMap((match) => [match.home.code, match.away.code]),
    );
    const visibleText = Array.from<SVGTextElement>(
      fixture.nativeElement.querySelectorAll('svg text'),
    ).map((element) => element.textContent?.trim());

    expect(visibleText.some((text) => text && countryCodes.has(text))).toBe(false);
  });

  it('retains accessible labels for the bracket and its flag nodes', () => {
    fixture.detectChanges();

    const svg = fixture.nativeElement.querySelector('svg');
    const nodes = Array.from<SVGGElement>(fixture.nativeElement.querySelectorAll('g.node'));

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toContain('World Cup 2026 knockout bracket');
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.every((node) => node.querySelector('title')?.textContent?.trim())).toBe(true);
  });
});
