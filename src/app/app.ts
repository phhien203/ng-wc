import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { BracketWheel } from './bracket-wheel/bracket-wheel';
import { KnockoutFeed } from './knockout-feed';
import { Predictions } from './predictions';
import { Match, Side, Team, kickoffMs, winnerOf } from './knockout-data';

interface FixtureRow {
  match: Match;
  winner: Team | null;
  /** Kickoff time label in the active timezone */
  time: string;
  live: boolean;
  next: boolean;
  pick: Side | null;
}

interface DayGroup {
  date: string;
  rows: FixtureRow[];
}

/** A match without a result within this window after kickoff is considered live. */
const LIVE_WINDOW_MS = 150 * 60 * 1000;
const TZ_KEY = 'wc2026.timezone';

const localTimeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const localDateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function loadTz(): 'fin' | 'local' {
  try {
    return localStorage.getItem(TZ_KEY) === 'local' ? 'local' : 'fin';
  } catch {
    return 'fin';
  }
}

@Component({
  selector: 'app-root',
  imports: [BracketWheel, NgOptimizedImage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { '(document:keydown.escape)': 'pinnedId.set(null)' },
})
export class App {
  private readonly feed = inject(KnockoutFeed);
  protected readonly predictions = inject(Predictions);

  /** Match data, auto-updated every hour via the custom `poll` operator. */
  protected readonly matches = this.feed.matches;

  /** Ticks every 30 s so the countdown and LIVE badge stay fresh. */
  private readonly now = signal(Date.now());

  /** Hover previews the highlight; clicking a fixture pins it (Esc or re-click unpins). */
  private readonly hoverId = signal<number | null>(null);
  protected readonly pinnedId = signal<number | null>(null);
  protected readonly highlighted = computed(() => this.pinnedId() ?? this.hoverId());

  /** Kickoff times shown in Finland time (as published) or the viewer's local time. */
  protected readonly tzMode = signal<'fin' | 'local'>(loadTz());
  protected readonly tzLabel = computed(() => (this.tzMode() === 'fin' ? 'EEST (Helsinki)' : localZone));

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 30_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  /** Matches currently in progress (kicked off, no result yet). */
  private readonly liveIds = computed<ReadonlySet<number>>(() => {
    const t = this.now();
    const ids = new Set<number>();
    for (const m of this.matches()) {
      const ko = kickoffMs(m);
      if (!m.winner && ko <= t && t - ko < LIVE_WINDOW_MS) ids.add(m.id);
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

  /** 16 matches grouped by day in the active timezone, newest → oldest */
  protected readonly days = computed<DayGroup[]>(() => {
    const local = this.tzMode() === 'local';
    const liveIds = this.liveIds();
    const nextId = this.nextMatch()?.id ?? null;
    const picks = this.predictions.picks();
    const sorted = [...this.matches()].sort((a, b) => b.koISO.localeCompare(a.koISO));
    const groups = new Map<string, FixtureRow[]>();
    for (const m of sorted) {
      const ko = new Date(kickoffMs(m));
      const date = local ? localDateFmt.format(ko).replace(',', '') : m.koDate;
      const row: FixtureRow = {
        match: m,
        winner: winnerOf(m),
        time: local ? localTimeFmt.format(ko) : m.koTime,
        live: liveIds.has(m.id),
        next: m.id === nextId,
        pick: m.winner ? null : (picks[m.id] ?? null),
      };
      const list = groups.get(date);
      if (list) list.push(row);
      else groups.set(date, [row]);
    }
    return Array.from(groups, ([date, rows]) => ({ date, rows }));
  });

  protected flagUrl(team: Team): string {
    return `flags/${team.flag}.svg`;
  }

  protected setHover(id: number | null): void {
    this.hoverId.set(id);
  }

  protected togglePin(id: number): void {
    this.pinnedId.update((pinned) => (pinned === id ? null : id));
  }

  protected toggleTz(): void {
    this.tzMode.update((mode) => (mode === 'fin' ? 'local' : 'fin'));
    try {
      localStorage.setItem(TZ_KEY, this.tzMode());
    } catch {
      /* storage unavailable — keep in-memory only */
    }
  }
}
