import { Component, computed, inject, signal } from '@angular/core';
import { BracketWheel } from './bracket-wheel/bracket-wheel';
import { KnockoutFeed } from './knockout-feed';
import { Match, Team, winnerOf } from './knockout-data';

interface FixtureRow {
  match: Match;
  winner: Team | null;
}

interface DayGroup {
  date: string;
  rows: FixtureRow[];
}

@Component({
  selector: 'app-root',
  imports: [BracketWheel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly feed = inject(KnockoutFeed);

  protected readonly hovered = signal<number | null>(null);

  /** Match data, auto-updated every hour via the custom `poll` operator. */
  protected readonly matches = this.feed.matches;

  /** 16 matches grouped by day (Finland time), newest → oldest */
  protected readonly days = computed<DayGroup[]>(() => {
    const sorted = [...this.matches()].sort((a, b) => b.koISO.localeCompare(a.koISO));
    const groups = new Map<string, FixtureRow[]>();
    for (const m of sorted) {
      const row: FixtureRow = { match: m, winner: winnerOf(m) };
      const list = groups.get(m.koDate);
      if (list) list.push(row);
      else groups.set(m.koDate, [row]);
    }
    return Array.from(groups, ([date, rows]) => ({ date, rows }));
  });

  protected flagUrl(team: Team): string {
    return `flags/${team.flag}.svg`;
  }

  protected setHover(id: number | null): void {
    this.hovered.set(id);
  }
}
