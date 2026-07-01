import { EspnEvent, EspnScoreboard, mergeScoreboard } from './espn-scoreboard';
import { ROUND_OF_32 } from './knockout-data';

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

describe('mergeScoreboard', () => {
  const scoreboard: EspnScoreboard = {
    events: [
      // flipped home/away vs the bracket (bracket has PAR home), decided on pens
      event('post', 'FT-Pens', [
        { code: 'GER', score: '1', pen: 3 },
        { code: 'PAR', score: '1', pen: 4, winner: true },
      ]),
      // in progress
      event('in', "12'", [
        { code: 'BEL', score: '1' },
        { code: 'SEN', score: '0' },
      ]),
      // unknown pair (Round of 16) must be ignored
      event('post', 'FT', [
        { code: 'CAN', score: '2', winner: true },
        { code: 'MAR', score: '0' },
      ]),
    ],
  };

  const merged = mergeScoreboard(ROUND_OF_32, scoreboard);

  it('re-orients results to the bracket home/away and formats penalties', () => {
    const m1 = merged.find((m) => m.id === 1)!;
    expect(m1.winner).toBe('home'); // PAR is home in the bracket
    expect(m1.note).toBe('1-1 (pen 4-3)');
    expect(m1.state).toBe('post');
  });

  it('adds a live note for in-progress matches without setting a winner', () => {
    const m11 = merged.find((m) => m.id === 11)!;
    expect(m11.liveNote).toBe("1-0 · 12'");
    expect(m11.state).toBe('in');
    expect(m11.winner).toBeUndefined();
  });

  it('leaves matches absent from the payload untouched', () => {
    const m16 = merged.find((m) => m.id === 16)!;
    expect(m16.state).toBeUndefined();
    expect(m16.winner).toBeUndefined();
  });

  it('does not corrupt known matches with unknown pairs (CAN vs MAR is Round of 16)', () => {
    const canMatch = merged.find((m) => m.id === 3)!; // CAN vs RSA in the bracket
    expect(canMatch.note).toBe('1-0'); // bundled note, not the R16 result
  });
});
