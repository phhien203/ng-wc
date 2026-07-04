import { Component, computed, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Match, Team, winnerOf } from '../knockout-data';

interface FixtureRow {
  match: Match;
  winner: Team | null;
  /** Kickoff time label in Helsinki time */
  time: string;
  live: boolean;
  next: boolean;
}

interface DayGroup {
  date: string;
  rows: FixtureRow[];
}

@Component({
  selector: 'app-fixture-list',
  imports: [NgOptimizedImage],
  templateUrl: './fixture-list.html',
  styleUrl: './fixture-list.scss',
  host: { role: 'region', '[attr.aria-label]': 'title() + " fixtures"' },
})
export class FixtureList {
  /** Round title shown in the collapsible header, e.g. "Round of 16" */
  readonly title = input.required<string>();
  /** Whether the collapsible starts open */
  readonly expanded = input(true);
  readonly matches = input.required<Match[]>();
  /** Matches currently in progress */
  readonly liveIds = input<ReadonlySet<number>>(new Set());
  /** The next match to kick off */
  readonly nextId = input<number | null>(null);
  /** Highlighted match (synced with the bracket wheel) */
  readonly highlighted = input<number | null>(null);
  /** Hovering or focusing a fixture row */
  readonly hoverChange = output<number | null>();

  /** Matches grouped by day in Helsinki time, newest → oldest */
  protected readonly days = computed<DayGroup[]>(() => {
    const liveIds = this.liveIds();
    const nextId = this.nextId();
    const sorted = [...this.matches()].sort((a, b) => b.koISO.localeCompare(a.koISO));
    const groups = new Map<string, FixtureRow[]>();
    for (const m of sorted) {
      const row: FixtureRow = {
        match: m,
        winner: winnerOf(m),
        time: m.koTime,
        live: liveIds.has(m.id),
        next: m.id === nextId,
      };
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
    this.hoverChange.emit(id);
  }
}
