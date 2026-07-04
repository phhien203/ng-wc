import { Match, Side } from './knockout-data';

/** Minimal slice of ESPN's public scoreboard payload that we consume. */
export interface EspnScoreboard {
  events?: EspnEvent[];
}

export interface EspnEvent {
  status: { type: { state: 'pre' | 'in' | 'post'; shortDetail: string } };
  competitions: { competitors: EspnCompetitor[] }[];
}

export interface EspnCompetitor {
  winner?: boolean;
  score?: string;
  shootoutScore?: number | string | null;
  team: { abbreviation: string };
}

export const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260628-20260708';

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

/**
 * Merge live ESPN results into the bundled bracket.
 *
 * Matching is by unordered team-code pair because ESPN's home/away is often
 * flipped vs the bracket (scores/pens are re-oriented to our home/away).
 * Events for pairs the bracket doesn't know (e.g. later rounds) are ignored,
 * as are bracket matches missing from the payload.
 */
export function mergeScoreboard(bracket: Match[], scoreboard: EspnScoreboard): Match[] {
  const events = new Map<string, EspnEvent>();
  for (const e of scoreboard.events ?? []) {
    const comps = e.competitions[0]?.competitors;
    if (comps?.length === 2) {
      events.set(pairKey(comps[0].team.abbreviation, comps[1].team.abbreviation), e);
    }
  }
  return bracket.map((m) => {
    const e = events.get(pairKey(m.home.code, m.away.code));
    const comps = e?.competitions[0].competitors;
    const home = comps?.find((c) => c.team.abbreviation === m.home.code);
    const away = comps?.find((c) => c.team.abbreviation === m.away.code);
    if (!e || !home || !away) return m;
    const state = e.status.type.state;
    if (state === 'post') {
      const winner: Side | undefined = home.winner ? 'home' : away.winner ? 'away' : undefined;
      return { ...m, state, winner: winner ?? m.winner, note: formatNote(home, away) };
    }
    if (state === 'in') {
      return { ...m, state, liveNote: `${home.score ?? 0}-${away.score ?? 0} · ${e.status.type.shortDetail}` };
    }
    return { ...m, state };
  });
}

function formatNote(home: EspnCompetitor, away: EspnCompetitor): string {
  const score = `${home.score ?? 0}-${away.score ?? 0}`;
  return home.shootoutScore != null && away.shootoutScore != null
    ? `${score} (pen ${home.shootoutScore}-${away.shootoutScore})`
    : score;
}
