import {
  BRONZE_FINALS,
  Match,
  QUARTERFINALS,
  SEMIFINALS,
  Side,
  TBD,
  Team,
  withBronzeTeams,
  withQfTeams,
  withSfTeams,
} from './knockout-data';

const team = (code: string): Team => ({ code, name: code, flag: code.toLowerCase() });

function r16(id: number, home: Team, away: Team, winner?: Side): Match {
  return { id, round: 'R16', home, away, winner, koDate: 'x', koTime: '00:00', koISO: '2026-07-04T00:00' };
}

function qf(id: number, home: Team, away: Team, winner?: Side): Match {
  return { id, round: 'QF', home, away, winner, koDate: 'x', koTime: '00:00', koISO: '2026-07-09T00:00' };
}

function sf(id: number, home: Team, away: Team, winner?: Side): Match {
  return { id, round: 'SF', home, away, winner, koDate: 'x', koTime: '00:00', koISO: '2026-07-14T00:00' };
}

describe('withQfTeams', () => {
  it('leaves both slots TBD while the feeder matches are undecided', () => {
    const bracket = [r16(17, team('AAA'), team('BBB')), r16(18, team('CCC'), team('DDD')), ...QUARTERFINALS];
    const qfs = withQfTeams(bracket).filter((m) => m.round === 'QF');
    expect(qfs.length).toBe(4);
    for (const q of qfs) {
      expect(q.home).toBe(TBD);
      expect(q.away).toBe(TBD);
    }
  });

  it('fills both slots once both feeders are decided (home = first feeder winner)', () => {
    const bracket = [
      r16(17, team('AAA'), team('BBB'), 'away'),
      r16(18, team('CCC'), team('DDD'), 'away'),
      ...QUARTERFINALS,
    ];
    const resolved = withQfTeams(bracket);
    const qf1 = resolved.find((m) => m.id === 25)!;
    expect(qf1.home.code).toBe('BBB');
    expect(qf1.away.code).toBe('DDD');
  });

  it('resolves one slot and keeps the other TBD in a mixed feeder state', () => {
    const bracket = [
      r16(19, team('AAA'), team('BBB'), 'home'),
      r16(20, team('CCC'), team('DDD')),
      ...QUARTERFINALS,
    ];
    const resolved = withQfTeams(bracket);
    const qf2 = resolved.find((m) => m.id === 26)!;
    expect(qf2.home.code).toBe('AAA');
    expect(qf2.away).toBe(TBD);
  });

  it('does not modify non-QF matches', () => {
    const input = [r16(17, team('AAA'), team('BBB'), 'home'), ...QUARTERFINALS];
    const resolved = withQfTeams(input);
    expect(resolved[0]).toBe(input[0]);
  });

  it('keeps the published QF schedule metadata intact', () => {
    for (const q of QUARTERFINALS) {
      expect(q.koDate).toBeTruthy();
      expect(q.koTime).toBeTruthy();
      expect(q.koISO.startsWith('2026-07-')).toBe(true);
    }
  });
});

describe('withSfTeams', () => {
  it('pairs QF winners by bracket half (QF25 & QF27 → SF1, QF26 & QF28 → SF2), not adjacent ids', () => {
    const bracket = [
      qf(25, team('AAA'), team('BBB'), 'home'), // winner AAA
      qf(26, team('CCC'), team('DDD')), // undecided
      qf(27, team('EEE'), team('FFF'), 'away'), // winner FFF
      qf(28, team('GGG'), team('HHH')), // undecided
      ...SEMIFINALS,
    ];
    const resolved = withSfTeams(bracket);
    const sf1 = resolved.find((m) => m.id === 29)!;
    expect(sf1.home.code).toBe('AAA');
    expect(sf1.away.code).toBe('FFF');
    const sf2 = resolved.find((m) => m.id === 30)!;
    expect(sf2.home).toBe(TBD);
    expect(sf2.away).toBe(TBD);
  });

  it('does not modify non-SF matches', () => {
    const input = [qf(25, team('AAA'), team('BBB'), 'home'), ...SEMIFINALS];
    const resolved = withSfTeams(input);
    expect(resolved[0]).toBe(input[0]);
  });

  it('keeps the published SF schedule metadata intact', () => {
    for (const sf of SEMIFINALS) {
      expect(sf.koDate).toBeTruthy();
      expect(sf.koTime).toBeTruthy();
      expect(sf.koISO.startsWith('2026-07-')).toBe(true);
    }
  });
});

describe('withBronzeTeams', () => {
  it('pairs the two Semifinal losers in the bronze final', () => {
    const bracket = [
      sf(29, team('AAA'), team('BBB'), 'home'),
      sf(30, team('CCC'), team('DDD'), 'away'),
      ...BRONZE_FINALS,
    ];

    const bronze = withBronzeTeams(bracket).find((m) => m.round === 'B')!;

    expect(bronze.home.code).toBe('BBB');
    expect(bronze.away.code).toBe('CCC');
    expect(bronze.koISO).toBe('2026-07-19T00:00');
  });
});
