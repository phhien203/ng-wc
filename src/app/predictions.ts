import { Service, computed, signal } from '@angular/core';
import { Side } from './knockout-data';

const STORAGE_KEY = 'wc2026.predictions';

function load(): Record<number, Side> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const picks: Record<number, Side> = {};
    for (const [id, side] of Object.entries(parsed)) {
      if (side === 'home' || side === 'away') picks[Number(id)] = side;
    }
    return picks;
  } catch {
    return {};
  }
}

/**
 * User's pick'em predictions for undecided matches, persisted in localStorage.
 * Picking the already-picked side clears the pick.
 */
@Service()
export class Predictions {
  private readonly _picks = signal<Record<number, Side>>(load());

  readonly picks = this._picks.asReadonly();
  readonly count = computed(() => Object.keys(this._picks()).length);

  toggle(matchId: number, side: Side): void {
    this._picks.update((picks) => {
      const next = { ...picks };
      if (next[matchId] === side) delete next[matchId];
      else next[matchId] = side;
      return next;
    });
    this.save();
  }

  clear(): void {
    this._picks.set({});
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._picks()));
    } catch {
      /* storage unavailable — picks stay in memory */
    }
  }
}
