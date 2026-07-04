/**
 * REAL World Cup 2026 knockout data (Canada/Mexico/USA).
 * Source: Yahoo Sports & CBS Sports — updated Jul 4, 2026:
 * Round of 32 is complete; the Round of 16 (Jul 4–7) is scheduled.
 *
 * Matches are ordered to follow the actual bracket, so:
 *   - R32 pairs (M1,M2),(M3,M4)... meet in the Round of 16
 *   - consecutive R16 pairs meet in the Quarterfinals
 * To update a result: just set `winner` on the match.
 */

export interface Team {
  /** 3-letter display code */
  code: string;
  /** Full name */
  name: string;
  /** SVG flag file name in /public/flags (ISO 3166-1 alpha-2) */
  flag: string;
}

export type Side = 'home' | 'away';

export type Round = 'R32' | 'R16';

export interface Match {
  id: number;
  /** Knockout round this match belongs to */
  round: Round;
  home: Team;
  away: Team;
  /** Winning team (once decided). undefined = not finished yet. */
  winner?: Side;
  /** Result note, e.g. score/penalties */
  note?: string;
  /** Match state from the live score feed; absent for the bundled fallback data */
  state?: 'pre' | 'in' | 'post';
  /** Score + match clock while in progress, e.g. "1-0 · 63'" */
  liveNote?: string;
  /** Match date in Finland time (EEST, UTC+3) — e.g. "Mon Jun 29" */
  koDate: string;
  /** Kickoff time in Finland time, e.g. "23:30" */
  koTime: string;
  /** ISO in Finland time for sorting, e.g. "2026-06-29T23:30" */
  koISO: string;
}

// prettier-ignore
const T = {
  PAR: { code: 'PAR', name: 'Paraguay',               flag: 'py' },
  GER: { code: 'GER', name: 'Germany',                flag: 'de' },
  FRA: { code: 'FRA', name: 'France',                 flag: 'fr' },
  SWE: { code: 'SWE', name: 'Sweden',                 flag: 'se' },
  CAN: { code: 'CAN', name: 'Canada',                 flag: 'ca' },
  RSA: { code: 'RSA', name: 'South Africa',           flag: 'za' },
  MAR: { code: 'MAR', name: 'Morocco',                flag: 'ma' },
  NED: { code: 'NED', name: 'Netherlands',            flag: 'nl' },
  BRA: { code: 'BRA', name: 'Brazil',                 flag: 'br' },
  JPN: { code: 'JPN', name: 'Japan',                  flag: 'jp' },
  CIV: { code: 'CIV', name: 'Ivory Coast',            flag: 'ci' },
  NOR: { code: 'NOR', name: 'Norway',                 flag: 'no' },
  MEX: { code: 'MEX', name: 'Mexico',                 flag: 'mx' },
  ECU: { code: 'ECU', name: 'Ecuador',                flag: 'ec' },
  ENG: { code: 'ENG', name: 'England',                flag: 'gb-eng' },
  COD: { code: 'COD', name: 'DR Congo',               flag: 'cd' },
  ESP: { code: 'ESP', name: 'Spain',                  flag: 'es' },
  AUT: { code: 'AUT', name: 'Austria',                flag: 'at' },
  POR: { code: 'POR', name: 'Portugal',               flag: 'pt' },
  CRO: { code: 'CRO', name: 'Croatia',                flag: 'hr' },
  BEL: { code: 'BEL', name: 'Belgium',                flag: 'be' },
  SEN: { code: 'SEN', name: 'Senegal',                flag: 'sn' },
  USA: { code: 'USA', name: 'United States',          flag: 'us' },
  BIH: { code: 'BIH', name: 'Bosnia & Herzegovina',   flag: 'ba' },
  AUS: { code: 'AUS', name: 'Australia',              flag: 'au' },
  EGY: { code: 'EGY', name: 'Egypt',                  flag: 'eg' },
  ARG: { code: 'ARG', name: 'Argentina',             flag: 'ar' },
  CPV: { code: 'CPV', name: 'Cape Verde',             flag: 'cv' },
  SUI: { code: 'SUI', name: 'Switzerland',            flag: 'ch' },
  ALG: { code: 'ALG', name: 'Algeria',                flag: 'dz' },
  COL: { code: 'COL', name: 'Colombia',               flag: 'co' },
  GHA: { code: 'GHA', name: 'Ghana',                  flag: 'gh' },
} satisfies Record<string, Team>;

/** A match as written in the tables below — `round` is stamped on per array. */
type MatchSeed = Omit<Match, 'round'>;

/**
 * The 16 Round of 32 matches, in true bracket order. All played.
 */
// prettier-ignore
const R32_SEED: MatchSeed[] = [
  { id: 1,  home: T.PAR, away: T.GER, winner: 'home', note: '1-1 (pen 4-3)', koDate: 'Mon Jun 29', koTime: '23:30', koISO: '2026-06-29T23:30' },
  { id: 2,  home: T.FRA, away: T.SWE, winner: 'home', note: '3-0',           koDate: 'Wed Jul 1',  koTime: '00:00', koISO: '2026-07-01T00:00' },
  { id: 3,  home: T.CAN, away: T.RSA, winner: 'home', note: '1-0',           koDate: 'Sun Jun 28', koTime: '22:00', koISO: '2026-06-28T22:00' },
  { id: 4,  home: T.MAR, away: T.NED, winner: 'home', note: '1-1 (pen 3-2)', koDate: 'Tue Jun 30', koTime: '04:00', koISO: '2026-06-30T04:00' },
  { id: 5,  home: T.BRA, away: T.JPN, winner: 'home', note: '2-1',           koDate: 'Mon Jun 29', koTime: '20:00', koISO: '2026-06-29T20:00' },
  { id: 6,  home: T.CIV, away: T.NOR, winner: 'away', note: '1-2',           koDate: 'Tue Jun 30', koTime: '20:00', koISO: '2026-06-30T20:00' },
  { id: 7,  home: T.MEX, away: T.ECU, winner: 'home', note: '2-0',           koDate: 'Wed Jul 1',  koTime: '04:00', koISO: '2026-07-01T04:00' },
  { id: 8,  home: T.ENG, away: T.COD, winner: 'home', note: '2-1',           koDate: 'Wed Jul 1',  koTime: '19:00', koISO: '2026-07-01T19:00' },
  { id: 9,  home: T.ESP, away: T.AUT, winner: 'home', note: '3-0',           koDate: 'Thu Jul 2',  koTime: '22:00', koISO: '2026-07-02T22:00' },
  { id: 10, home: T.POR, away: T.CRO, winner: 'home', note: '2-1',           koDate: 'Fri Jul 3',  koTime: '02:00', koISO: '2026-07-03T02:00' },
  { id: 11, home: T.BEL, away: T.SEN, winner: 'home', note: '3-2 (aet)',     koDate: 'Wed Jul 1',  koTime: '23:00', koISO: '2026-07-01T23:00' },
  { id: 12, home: T.USA, away: T.BIH, winner: 'home', note: '2-0',           koDate: 'Thu Jul 2',  koTime: '03:00', koISO: '2026-07-02T03:00' },
  { id: 13, home: T.AUS, away: T.EGY, winner: 'away', note: '1-1 (pen 2-4)', koDate: 'Fri Jul 3',  koTime: '21:00', koISO: '2026-07-03T21:00' },
  { id: 14, home: T.ARG, away: T.CPV, winner: 'home', note: '3-2 (aet)',     koDate: 'Sat Jul 4',  koTime: '01:00', koISO: '2026-07-04T01:00' },
  { id: 15, home: T.SUI, away: T.ALG, winner: 'home', note: '2-0',           koDate: 'Fri Jul 3',  koTime: '06:00', koISO: '2026-07-03T06:00' },
  { id: 16, home: T.COL, away: T.GHA, winner: 'home', note: '1-0',           koDate: 'Sat Jul 4',  koTime: '04:30', koISO: '2026-07-04T04:30' },
];

/**
 * The 8 Round of 16 matches (Jul 4–7), in true bracket order:
 * match j pairs the winners of R32 matches (2j+1, 2j+2), and `home` is
 * always the winner of the first match of that pair (matters for the wheel).
 */
// prettier-ignore
const R16_SEED: MatchSeed[] = [
  { id: 17, home: T.PAR, away: T.FRA, koDate: 'Sun Jul 5', koTime: '00:00', koISO: '2026-07-05T00:00' },
  { id: 18, home: T.CAN, away: T.MAR, koDate: 'Sat Jul 4', koTime: '20:00', koISO: '2026-07-04T20:00' },
  { id: 19, home: T.BRA, away: T.NOR, koDate: 'Sun Jul 5', koTime: '23:00', koISO: '2026-07-05T23:00' },
  { id: 20, home: T.MEX, away: T.ENG, koDate: 'Mon Jul 6', koTime: '03:00', koISO: '2026-07-06T03:00' },
  { id: 21, home: T.ESP, away: T.POR, koDate: 'Mon Jul 6', koTime: '22:00', koISO: '2026-07-06T22:00' },
  { id: 22, home: T.BEL, away: T.USA, koDate: 'Tue Jul 7', koTime: '03:00', koISO: '2026-07-07T03:00' },
  { id: 23, home: T.EGY, away: T.ARG, koDate: 'Tue Jul 7', koTime: '19:00', koISO: '2026-07-07T19:00' },
  { id: 24, home: T.SUI, away: T.COL, koDate: 'Tue Jul 7', koTime: '23:00', koISO: '2026-07-07T23:00' },
];

export const ROUND_OF_32: Match[] = R32_SEED.map((m) => ({ ...m, round: 'R32' }));
export const ROUND_OF_16: Match[] = R16_SEED.map((m) => ({ ...m, round: 'R16' }));

/** All knockout matches known so far, bracket-ordered within each round. */
export const KNOCKOUT_MATCHES: Match[] = [...ROUND_OF_32, ...ROUND_OF_16];

/** The winning team of a match, or null if not finished yet. */
export function winnerOf(m: Match): Team | null {
  if (!m.winner) return null;
  return m.winner === 'home' ? m.home : m.away;
}

/** Kickoff as epoch ms. `koISO` is Finland time, which is UTC+3 during the tournament. */
export function kickoffMs(m: Match): number {
  return Date.parse(`${m.koISO}:00+03:00`);
}
