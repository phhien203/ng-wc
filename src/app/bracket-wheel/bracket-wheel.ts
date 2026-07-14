import { Component, computed, input, output } from '@angular/core';
import { KNOCKOUT_MATCHES, Match, Team, winnerOf } from '../knockout-data';

/** A node on the SVG (team may be undecided → team = null) */
interface RNode {
  team: Team | null;
  x: number;
  y: number;
  r: number;
  matchId: number | null;
  /** Feeder match from the previous round — also keeps the node lit on hover */
  altId: number | null;
  advancing: boolean;
  /** Part of the next match to kick off */
  next: boolean;
  /** Part of a match currently in progress */
  live: boolean;
  decided: boolean;
  tip: string;
}

interface Link {
  d: string;
  matchId: number | null;
  /** Secondary match id that also keeps this link lit on hover */
  altId: number | null;
  decided: boolean;
  next: boolean;
  live: boolean;
}

const CX = 500;
const CY = 500;
const R_OUTER = 468;
const R_R16 = 382;
const R_QF = 282;
const R_SF = 186;
const R_F = 86;

/** Same node radius on every ring */
const NODE_R = 26;

/** The two teams of a match sit close together (in-pair gap < between-pair gap) */
const PAIR_HOME = 0.57;
const PAIR_AWAY = 1.43;

function polar(r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180); // 0° = top
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Quadratic curve from (r1,a1) through control point (rc,ac) to (r2,a2) */
function curve(r1: number, a1: number, rc: number, ac: number, r2: number, a2: number): string {
  const p1 = polar(r1, a1);
  const c = polar(rc, ac);
  const p2 = polar(r2, a2);
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${c.x.toFixed(1)} ${c.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

function tipOf(m: Match): string {
  const base = `${m.home.name} vs ${m.away.name} · ${m.koDate} ${m.koTime} (FIN)`;
  return m.note ? `${base} · ${m.note}` : m.liveNote ? `${base} · LIVE ${m.liveNote}` : base;
}

@Component({
  selector: 'app-bracket-wheel',
  imports: [],
  templateUrl: './bracket-wheel.html',
  styleUrl: './bracket-wheel.scss',
})
export class BracketWheel {
  readonly cx = CX;
  readonly cy = CY;
  readonly rOuter = R_OUTER;
  readonly rR16 = R_R16;
  readonly rQf = R_QF;
  readonly rSf = R_SF;
  readonly rF = R_F;
  readonly nodeR = NODE_R;

  /** Currently hovered match (synced with the external list) */
  readonly hovered = input<number | null>(null);
  readonly hoverChange = output<number | null>();

  /** Match data for all rounds, provided from outside (live feed, polled every minute). */
  readonly matches = input<Match[]>(KNOCKOUT_MATCHES);

  /** The next match to kick off (pulsing highlight) */
  readonly nextId = input<number | null>(null);

  /** Matches currently in progress (pulsing highlight on both teams) */
  readonly liveIds = input<ReadonlySet<number>>(new Set());

  private readonly r32 = computed(() => this.matches().filter((m) => m.round === 'R32'));
  private readonly r16 = computed(() => this.matches().filter((m) => m.round === 'R16'));
  private readonly qf = computed(() => this.matches().filter((m) => m.round === 'QF'));
  private readonly sf = computed(() => this.matches().filter((m) => m.round === 'SF'));

  /** Outer ring: 32 teams (Round of 32) */
  protected readonly outerNodes = computed<RNode[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    const nodes: RNode[] = [];
    this.r32().forEach((m, k) => {
      const homeA = (2 * k + PAIR_HOME) * (360 / 32);
      const awayA = (2 * k + PAIR_AWAY) * (360 / 32);
      const h = polar(R_OUTER, homeA);
      const a = polar(R_OUTER, awayA);
      const tip = tipOf(m);
      const next = m.id === nextId;
      const live = liveIds.has(m.id);
      const decided = !!m.winner;
      nodes.push({
        team: m.home, x: h.x, y: h.y, r: NODE_R, matchId: m.id, altId: null, decided, next, live,
        advancing: m.winner === 'home', tip,
      });
      nodes.push({
        team: m.away, x: a.x, y: a.y, r: NODE_R, matchId: m.id, altId: null, decided, next, live,
        advancing: m.winner === 'away', tip,
      });
    });
    return nodes;
  });

  /** Link between the two teams of each R32 match — arc bulging outward */
  protected readonly matchLinks = computed<Link[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    return this.r32().map((m, k) => {
      const homeA = (2 * k + PAIR_HOME) * (360 / 32);
      const awayA = (2 * k + PAIR_AWAY) * (360 / 32);
      const midA = (homeA + awayA) / 2;
      return {
        d: curve(R_OUTER, homeA, R_OUTER + 26, midA, R_OUTER, awayA),
        matchId: m.id, altId: null, decided: !!m.winner, next: m.id === nextId,
        live: liveIds.has(m.id),
      };
    });
  });

  /** Middle ring: 16 Round of 16 teams — home/away of the 8 real R16 matches */
  protected readonly r16Nodes = computed<RNode[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    const r32 = this.r32();
    const nodes: RNode[] = [];
    this.r16().forEach((m, j) => {
      const tip = tipOf(m);
      for (const [side, k] of [['home', 2 * j], ['away', 2 * j + 1]] as const) {
        const p = polar(R_R16, (k + 0.5) * (360 / 16));
        nodes.push({
          team: m[side], x: p.x, y: p.y, r: NODE_R,
          matchId: m.id, altId: r32[k]?.id ?? null,
          decided: !!m.winner, next: m.id === nextId, live: liveIds.has(m.id),
          advancing: m.winner === side, tip,
        });
      }
    });
    return nodes;
  });

  /** Link between the two teams of each R16 match — arc bulging outward */
  protected readonly r16MatchLinks = computed<Link[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    return this.r16().map((m, j) => {
      const homeA = (2 * j + 0.5) * (360 / 16);
      const awayA = (2 * j + 1.5) * (360 / 16);
      return {
        d: curve(R_R16, homeA, R_R16 + 24, (homeA + awayA) / 2, R_R16, awayA),
        matchId: m.id, altId: null, decided: !!m.winner, next: m.id === nextId,
        live: liveIds.has(m.id),
      };
    });
  });

  /** R32 → R16 links — converging curve, one per R32 team (same look as the inner links) */
  protected readonly r16Links = computed<Link[]>(() => {
    const r16 = this.r16();
    const links: Link[] = [];
    this.r32().forEach((m, k) => {
      const aR16 = (k + 0.5) * (360 / 16);
      const rOut = R_OUTER - NODE_R - 4;
      const rIn = R_R16 + NODE_R + 4;
      const altId = r16[Math.floor(k / 2)]?.id ?? null;
      for (const pos of [PAIR_HOME, PAIR_AWAY]) {
        const a = (2 * k + pos) * (360 / 32);
        links.push({
          d: curve(rOut, a, (rOut + rIn) / 2, (a + aR16) / 2, rIn, aR16),
          matchId: m.id, altId, decided: !!m.winner, next: false, live: false,
        });
      }
    });
    return links;
  });

  /** Quarterfinal ring: 8 slots — R16 winners once decided */
  protected readonly qfNodes = computed<RNode[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    const qf = this.qf();
    return this.r16().map((m, j) => {
      const p = polar(R_QF, (j + 0.5) * (360 / 8));
      const w = winnerOf(m);
      // consecutive R16 winners meet in the same Quarterfinal (bracket order)
      const qfMatch = qf[Math.floor(j / 2)] ?? null;
      return {
        team: w, x: p.x, y: p.y, r: NODE_R, matchId: m.id, altId: null,
        decided: !!w, next: qfMatch?.id === nextId, live: qfMatch !== null && liveIds.has(qfMatch.id),
        advancing: !!w,
        tip: w ? `${w.name} → Quarterfinals` : 'Quarterfinal — to be decided',
      };
    });
  });

  /** R16 → Quarterfinal links — converging curve, one per R16 team */
  protected readonly qfLinks = computed<Link[]>(() => {
    const r16 = this.r16();
    const links: Link[] = [];
    for (let k = 0; k < 16; k++) {
      const m = r16[Math.floor(k / 2)];
      const aIn = (k + 0.5) * (360 / 16);
      const aQf = (Math.floor(k / 2) + 0.5) * (360 / 8);
      const rIn = R_R16 - NODE_R - 4;
      const rQf = R_QF + NODE_R + 4;
      links.push({
        d: curve(rIn, aIn, (rIn + rQf) / 2, (aIn + aQf) / 2, rQf, aQf),
        matchId: m?.id ?? null, altId: null, decided: !!m?.winner, next: false, live: false,
      });
    }
    return links;
  });

  /** Innermost ring: 4 Semifinal slots — Quarterfinal winners once decided */
  protected readonly sfNodes = computed<RNode[]>(() => {
    const nextId = this.nextId();
    const liveIds = this.liveIds();
    const sf = this.sf();
    return this.qf().map((m, j) => {
      const p = polar(R_SF, (j + 0.5) * (360 / 4));
      const w = winnerOf(m);
      // bracket halves, not adjacent QF ids: QF25&27 → SF1, QF26&28 → SF2
      const sfMatch = sf[Math.floor(j / 2)] ?? null;
      return {
        team: w, x: p.x, y: p.y, r: NODE_R, matchId: m.id, altId: null,
        decided: !!w, next: sfMatch?.id === nextId, live: sfMatch !== null && liveIds.has(sfMatch.id),
        advancing: !!w,
        tip: w ? `${w.name} → Semifinals` : 'Semifinal — to be decided',
      };
    });
  });

  /** Quarterfinal → Semifinal links — converging curve, one per Quarterfinal winner */
  protected readonly sfLinks = computed<Link[]>(() => {
    const qf = this.qf();
    const links: Link[] = [];
    for (let k = 0; k < 8; k++) {
      const m = qf[Math.floor(k / 2)];
      const aQf = (k + 0.5) * (360 / 8);
      const aSf = (Math.floor(k / 2) + 0.5) * (360 / 4);
      const rQf = R_QF - NODE_R - 4;
      const rSf = R_SF + NODE_R + 4;
      links.push({
        d: curve(rQf, aQf, (rQf + rSf) / 2, (aQf + aSf) / 2, rSf, aSf),
        matchId: m?.id ?? null, altId: null, decided: !!m?.winner, next: false, live: false,
      });
    }
    return links;
  });

  /** Center ring: the 2 Final slots (TBD), flanking the trophy */
  protected readonly finalNodes = computed<RNode[]>(() => {
    return Array.from({ length: 2 }, (_, j) => {
      const p = polar(R_F, (j + 0.5) * (360 / 2));
      return {
        team: null, x: p.x, y: p.y, r: NODE_R, matchId: null, altId: null,
        decided: false, next: false, live: false, advancing: false,
        tip: 'Final — to be decided',
      };
    });
  });

  /** Semifinal → Final links — converging curve (always dashed, not played yet) */
  protected readonly finalLinks = computed<Link[]>(() => {
    const links: Link[] = [];
    for (let k = 0; k < 4; k++) {
      const aSf = (k + 0.5) * (360 / 4);
      const aF = (Math.floor(k / 2) + 0.5) * (360 / 2);
      const rSf = R_SF - NODE_R - 4;
      const rF = R_F + NODE_R + 4;
      links.push({
        d: curve(rSf, aSf, (rSf + rF) / 2, (aSf + aF) / 2, rF, aF),
        matchId: null, altId: null, decided: false, next: false, live: false,
      });
    }
    return links;
  });

  protected flagUrl(team: Team): string {
    return `flags/${team.flag}.svg`;
  }

  protected isDimmed(matchId: number | null, altId: number | null = null): boolean {
    const h = this.hovered();
    return h !== null && matchId !== null && h !== matchId && h !== altId;
  }

  protected onEnter(matchId: number | null): void {
    if (matchId !== null) this.hoverChange.emit(matchId);
  }

  protected onLeave(): void {
    this.hoverChange.emit(null);
  }
}
