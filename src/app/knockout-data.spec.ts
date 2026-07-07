import { KNOCKOUT_MATCHES, Match, QUARTERFINALS, TBD, withQfTeams } from './knockout-data';

/** The bracket with `winner` stamped on the given R16 match ids ('home' wins). */
function withWinners(ids: number[], side: 'home' | 'away' = 'home'): Match[] {
  return KNOCKOUT_MATCHES.map((m) => (ids.includes(m.id) ? { ...m, winner: side } : m));
}

describe('withQfTeams', () => {
  it('leaves both slots TBD while the feeder matches are undecided', () => {
    const qfs = withQfTeams(KNOCKOUT_MATCHES).filter((m) => m.round === 'QF');
    expect(qfs.length).toBe(4);
    for (const qf of qfs) {
      expect(qf.home).toBe(TBD);
      expect(qf.away).toBe(TBD);
    }
  });

  it('fills both slots once both feeders are decided (home = first feeder winner)', () => {
    const resolved = withQfTeams(withWinners([17, 18], 'away'));
    const qf1 = resolved.find((m) => m.id === 25)!;
    // R16 match 17 is PAR vs FRA, match 18 is CAN vs MAR — away winners
    expect(qf1.home.code).toBe('FRA');
    expect(qf1.away.code).toBe('MAR');
  });

  it('resolves one slot and keeps the other TBD in a mixed feeder state', () => {
    const resolved = withQfTeams(withWinners([19])); // BRA win; match 20 undecided
    const qf2 = resolved.find((m) => m.id === 26)!;
    expect(qf2.home.code).toBe('BRA');
    expect(qf2.away).toBe(TBD);
  });

  it('does not modify non-QF matches', () => {
    const input = withWinners([17]);
    const resolved = withQfTeams(input);
    for (const [i, m] of resolved.entries()) {
      if (m.round !== 'QF') expect(m).toBe(input[i]);
    }
  });

  it('keeps the published QF schedule metadata intact', () => {
    for (const qf of QUARTERFINALS) {
      expect(qf.koDate).toBeTruthy();
      expect(qf.koTime).toBeTruthy();
      expect(qf.koISO.startsWith('2026-07-')).toBe(true);
    }
  });
});
