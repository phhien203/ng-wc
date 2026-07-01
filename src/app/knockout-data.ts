/**
 * REAL World Cup 2026 knockout data (Canada/Mexico/USA).
 * Source: Yahoo Sports & CBS Sports — Round of 32 bracket, updated Jun 30, 2026.
 * Some matches already have results; the rest are not played yet (winner = undefined).
 *
 * The 16 matches are ordered to follow the actual bracket, so:
 *   - pairs (M1,M2),(M3,M4)... meet in the Round of 16
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

export interface Match {
  id: number;
  home: Team;
  away: Team;
  /** Winning team (once decided). undefined = not finished yet. */
  winner?: 'home' | 'away';
  /** Result note, e.g. score/penalties */
  note?: string;
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

/**
 * The 16 Round of 32 matches, in true bracket order.
 * For readability, the winner (when known) is placed as `home`.
 */
export const ROUND_OF_32: Match[] = [
  { id: 1,  home: T.PAR, away: T.GER, winner: 'home', note: '1-1 (pen 4-3)', koDate: 'Mon Jun 29', koTime: '23:30', koISO: '2026-06-29T23:30' },
  { id: 2,  home: T.FRA, away: T.SWE, winner: 'home', note: '3-0',           koDate: 'Wed Jul 1',  koTime: '00:00', koISO: '2026-07-01T00:00' },
  { id: 3,  home: T.CAN, away: T.RSA, winner: 'home', note: '1-0',           koDate: 'Sun Jun 28', koTime: '22:00', koISO: '2026-06-28T22:00' },
  { id: 4,  home: T.MAR, away: T.NED, winner: 'home', note: '1-1 (pen 3-2)', koDate: 'Tue Jun 30', koTime: '04:00', koISO: '2026-06-30T04:00' },
  { id: 5,  home: T.BRA, away: T.JPN, winner: 'home', note: '2-1',           koDate: 'Mon Jun 29', koTime: '20:00', koISO: '2026-06-29T20:00' },
  { id: 6,  home: T.CIV, away: T.NOR, winner: 'away', note: '1-2',           koDate: 'Tue Jun 30', koTime: '20:00', koISO: '2026-06-30T20:00' },
  { id: 7,  home: T.MEX, away: T.ECU, winner: 'home', note: '2-0',           koDate: 'Wed Jul 1',  koTime: '04:00', koISO: '2026-07-01T04:00' },
  { id: 8,  home: T.ENG, away: T.COD,                                        koDate: 'Wed Jul 1',  koTime: '19:00', koISO: '2026-07-01T19:00' },
  { id: 9,  home: T.ESP, away: T.AUT,                                        koDate: 'Thu Jul 2',  koTime: '22:00', koISO: '2026-07-02T22:00' },
  { id: 10, home: T.POR, away: T.CRO,                                        koDate: 'Fri Jul 3',  koTime: '02:00', koISO: '2026-07-03T02:00' },
  { id: 11, home: T.BEL, away: T.SEN,                                        koDate: 'Wed Jul 1',  koTime: '23:00', koISO: '2026-07-01T23:00' },
  { id: 12, home: T.USA, away: T.BIH,                                        koDate: 'Thu Jul 2',  koTime: '03:00', koISO: '2026-07-02T03:00' },
  { id: 13, home: T.AUS, away: T.EGY,                                        koDate: 'Fri Jul 3',  koTime: '21:00', koISO: '2026-07-03T21:00' },
  { id: 14, home: T.ARG, away: T.CPV,                                        koDate: 'Sat Jul 4',  koTime: '01:00', koISO: '2026-07-04T01:00' },
  { id: 15, home: T.SUI, away: T.ALG,                                        koDate: 'Fri Jul 3',  koTime: '06:00', koISO: '2026-07-03T06:00' },
  { id: 16, home: T.COL, away: T.GHA,                                        koDate: 'Sat Jul 4',  koTime: '04:30', koISO: '2026-07-04T04:30' },
];

/** The winning team of a match, or null if not finished yet. */
export function winnerOf(m: Match): Team | null {
  if (!m.winner) return null;
  return m.winner === 'home' ? m.home : m.away;
}
