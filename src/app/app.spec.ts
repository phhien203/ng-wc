import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('KnockoutBracket');
  });

  it('renders a Semifinals section: both SF1 and SF2 teams known (all QFs decided)', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = Array.from(compiled.querySelectorAll('app-fixture-list'));
    const sf = sections.find((s) => s.querySelector('h2')?.textContent === 'Semifinals');
    expect(sf).toBeTruthy();
    const rows = sf!.querySelectorAll('li.fixture');
    expect(rows.length).toBe(2);
    const alts = Array.from(sf!.querySelectorAll('img.flag')).map((img) => img.getAttribute('alt'));
    // All 4 Quarterfinals are decided, so both Semifinals are fully resolved.
    expect(alts.filter((a) => a === 'To be decided').length).toBe(0);
    expect(alts).toContain('France');
    expect(alts).toContain('Spain');
    expect(alts).toContain('England');
    expect(alts).toContain('Argentina');
  });

  it('renders a Quarterfinals section with 4 fixtures, all teams known (R16 complete)', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = Array.from(compiled.querySelectorAll('app-fixture-list'));
    const qf = sections.find((s) => s.querySelector('h2')?.textContent === 'Quarterfinals');
    expect(qf).toBeTruthy();
    const rows = qf!.querySelectorAll('li.fixture');
    expect(rows.length).toBe(4);
    const alts = Array.from(qf!.querySelectorAll('img.flag')).map((img) => img.getAttribute('alt'));
    // Every QF team is derived from a decided Round of 16 winner, so none are TBD —
    // even though 2 of the 4 Quarterfinal matches themselves haven't been played yet.
    expect(alts.filter((a) => a === 'To be decided').length).toBe(0);
    expect(alts).toContain('France');
    expect(alts).toContain('Norway');
  });
});
