import { EspnEvent, EspnScoreboard, SCOREBOARD_URL, mergeScoreboard } from './espn-scoreboard';
import { Match, TBD, Team } from './knockout-data';

interface Comp {
  code: string;
  score?: string;
  pen?: number;
  winner?: boolean;
}

function event(state: 'pre' | 'in' | 'post', shortDetail: string, comps: [Comp, Comp]): EspnEvent {
  return {
    status: { type: { state, shortDetail } },
    competitions: [
      {
        competitors: comps.map((c) => ({
          winner: c.winner,
          score: c.score,
          shootoutScore: c.pen,
          team: { abbreviation: c.code },
        })),
      },
    ],
  };
}

const team = (code: string): Team => ({ code, name: code, flag: code.toLowerCase() });

/** A minimal synthetic bracket, decoupled from the real bundled results. */
const bracket: Match[] = [
  { id: 1, round: 'R32', home: team('PAR'), away: team('GER'), koDate: 'x', koTime: '00:00', koISO: '2026-06-29T00:00' },
  { id: 18, round: 'R16', home: team('CAN'), away: team('MAR'), koDate: 'x', koTime: '00:00', koISO: '2026-07-04T00:00' },
  { id: 19, round: 'R16', home: team('BRA'), away: team('NOR'), koDate: 'x', koTime: '00:00', koISO: '2026-07-05T00:00' },
  { id: 20, round: 'R16', home: team('MEX'), away: team('ENG'), koDate: 'x', koTime: '00:00', koISO: '2026-07-06T00:00' },
  { id: 24, round: 'R16', home: team('SUI'), away: team('COL'), koDate: 'x', koTime: '00:00', koISO: '2026-07-07T00:00' },
  { id: 25, round: 'QF', home: TBD, away: TBD, koDate: 'x', koTime: '00:00', koISO: '2026-07-09T00:00' },
];

it('polls through the Final and bronze final date', () => {
  expect(SCOREBOARD_URL).toContain('20260720');
});

describe('mergeScoreboard', () => {
  const scoreboard: EspnScoreboard = {
    events: [
      // flipped home/away vs the bracket (bracket has PAR home), decided on pens
      event('post', 'FT-Pens', [
        { code: 'GER', score: '1', pen: 3 },
        { code: 'PAR', score: '1', pen: 4, winner: true },
      ]),
      // Round of 16 match in progress, flipped vs the bracket (bracket has CAN home)
      event('in', "12'", [
        { code: 'MAR', score: '0' },
        { code: 'CAN', score: '1' },
      ]),
      // unknown pair (a possible Quarterfinal) must be ignored
      event('post', 'FT', [
        { code: 'BRA', score: '2', winner: true },
        { code: 'ENG', score: '0' },
      ]),
    ],
  };

  const merged = mergeScoreboard(bracket, scoreboard);

  it('re-orients results to the bracket home/away and formats penalties', () => {
    const m1 = merged.find((m) => m.id === 1)!;
    expect(m1.winner).toBe('home'); // PAR is home in the bracket
    expect(m1.note).toBe('1-1 (pen 4-3)');
    expect(m1.state).toBe('post');
  });

  it('adds a live note for in-progress matches without setting a winner', () => {
    const m18 = merged.find((m) => m.id === 18)!; // CAN vs MAR in the bracket
    expect(m18.liveNote).toBe("1-0 · 12'"); // re-oriented: CAN is home
    expect(m18.state).toBe('in');
    expect(m18.winner).toBeUndefined();
  });

  it('leaves matches absent from the payload untouched', () => {
    const m24 = merged.find((m) => m.id === 24)!; // SUI vs COL, not in the payload
    expect(m24.state).toBeUndefined();
    expect(m24.winner).toBeUndefined();
  });

  it('does not corrupt known matches with unknown pairs (BRA vs ENG is not a bracket match)', () => {
    const braMatch = merged.find((m) => m.id === 19)!; // BRA vs NOR in the bracket
    expect(braMatch.winner).toBeUndefined();
    const engMatch = merged.find((m) => m.id === 20)!; // MEX vs ENG in the bracket
    expect(engMatch.winner).toBeUndefined();
  });

  it('leaves Quarterfinals with TBD teams untouched even when events are present', () => {
    const qf = merged.find((m) => m.id === 25)!;
    expect(qf.home).toBe(TBD);
    expect(qf.away).toBe(TBD);
    expect(qf.state).toBeUndefined();
    expect(qf.winner).toBeUndefined();
  });
});
