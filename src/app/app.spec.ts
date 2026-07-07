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

  it('renders a Quarterfinals section with 4 TBD fixtures and accessible flag alt text', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const sections = Array.from(compiled.querySelectorAll('app-fixture-list'));
    const qf = sections.find((s) => s.querySelector('h2')?.textContent === 'Quarterfinals');
    expect(qf).toBeTruthy();
    const rows = qf!.querySelectorAll('li.fixture');
    expect(rows.length).toBe(4);
    for (const img of qf!.querySelectorAll('img.flag')) {
      expect(img.getAttribute('alt')).toBe('To be decided');
      expect(img.getAttribute('src')).toContain('flags/tbd.svg');
    }
  });
});
