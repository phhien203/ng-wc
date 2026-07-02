import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { BracketWheel } from './bracket-wheel/bracket-wheel';
import { KnockoutFeed } from './knockout-feed';
import { Match, Team, kickoffMs, winnerOf } from './knockout-data';

interface FixtureRow {
  match: Match;
  winner: Team | null;
  /** Kickoff time label in the active timezone */
  time: string;
  live: boolean;
  next: boolean;
}

interface DayGroup {
  date: string;
  rows: FixtureRow[];
}

/** A match without a result within this window after kickoff is considered live. */
const LIVE_WINDOW_MS = 150 * 60 * 1000;

@Component({
  selector: 'app-root',
  imports: [BracketWheel, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly feed = inject(KnockoutFeed);

  /** Match data, refreshed every minute from the live score feed. */
  protected readonly matches = this.feed.matches;

  /** Ticks every 30 s so the countdown and LIVE badge stay fresh. */
  private readonly now = signal(Date.now());

  /** Hovering a fixture highlights the matching wheel nodes (and vice versa). */
  protected readonly highlighted = signal<number | null>(null);

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  /** Matches currently in progress — from the live feed when available, else by kickoff window. */
  private readonly liveIds = computed<ReadonlySet<number>>(() => {
    const t = this.now();
    const ids = new Set<number>();
    for (const m of this.matches()) {
      if (m.winner) continue;
      if (m.state) {
        if (m.state === 'in') ids.add(m.id);
      } else {
        const ko = kickoffMs(m);
        if (ko <= t && t - ko < LIVE_WINDOW_MS) ids.add(m.id);
      }
    }
    return ids;
  });

  protected readonly liveMatch = computed<Match | null>(() => {
    const ids = this.liveIds();
    return this.matches().find((m) => ids.has(m.id)) ?? null;
  });

  /** The next match still to kick off. */
  protected readonly nextMatch = computed<Match | null>(() => {
    const t = this.now();
    let next: Match | null = null;
    for (const m of this.matches()) {
      if (m.winner || kickoffMs(m) <= t) continue;
      if (!next || kickoffMs(m) < kickoffMs(next)) next = m;
    }
    return next;
  });

  protected readonly countdown = computed(() => {
    const next = this.nextMatch();
    if (!next) return '';
    const mins = Math.max(1, Math.round((kickoffMs(next) - this.now()) / 60_000));
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${m}m`;
  });

  /** 16 matches grouped by day in Helsinki time, newest → oldest */
  protected readonly days = computed<DayGroup[]>(() => {
    const liveIds = this.liveIds();
    const nextId = this.nextMatch()?.id ?? null;
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
    this.highlighted.set(id);
  }
}
