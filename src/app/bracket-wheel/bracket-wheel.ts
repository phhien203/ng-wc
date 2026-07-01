import { Component, computed, input, output } from '@angular/core';
import { Match, ROUND_OF_32, Side, Team, winnerOf } from '../knockout-data';

/** A node on the SVG (team may be undecided → team = null) */
interface RNode {
  team: Team | null;
  x: number;
  y: number;
  r: number;
  matchId: number | null;
  advancing: boolean;
  /** User predicted this team to advance (match not decided yet) */
  predicted: boolean;
  /** Part of the next match to kick off */
  next: boolean;
  /** Which side of the match this node is (outer ring only, for click-to-pick) */
  side: Side | null;
  decided: boolean;
  tip: string;
}

interface Link {
  d: string;
  matchId: number | null;
  decided: boolean;
  predicted: boolean;
  next: boolean;
}

const CX = 500;
const CY = 500;
const R_OUTER = 468;
const R_R16 = 310;
const R_QF = 158;

const SIZE_OUTER = 30;
const SIZE_R16 = 27;
const SIZE_QF = 24;

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

@Component({
  selector: 'app-bracket-wheel',
  imports: [],
  templateUrl: './bracket-wheel.html',
  styleUrl: './bracket-wheel.scss',
})
export class BracketWheel {
  readonly cx = CX;
  readonly cy = CY;
  readonly sizeOuter = SIZE_OUTER;
  readonly sizeR16 = SIZE_R16;
  readonly sizeQf = SIZE_QF;

  /** Currently hovered match (synced with the external list) */
  readonly hovered = input<number | null>(null);
  readonly hoverChange = output<number | null>();

  /** Match data, provided from outside (polled hourly). */
  readonly matches = input<Match[]>(ROUND_OF_32);

  /** User pick'em predictions for undecided matches */
  readonly picks = input<Record<number, Side>>({});
  /** Clicking a team of an undecided match toggles the pick for that side */
  readonly pickChange = output<{ matchId: number; side: Side }>();

  /** The next match to kick off (pulsing highlight) */
  readonly nextId = input<number | null>(null);

  /** Outer ring: 32 teams (Round of 32) */
  protected readonly outerNodes = computed<RNode[]>(() => {
    const picks = this.picks();
    const nextId = this.nextId();
    const nodes: RNode[] = [];
    this.matches().forEach((m, k) => {
      const homeA = (2 * k + PAIR_HOME) * (360 / 32);
      const awayA = (2 * k + PAIR_AWAY) * (360 / 32);
      const h = polar(R_OUTER, homeA);
      const a = polar(R_OUTER, awayA);
      const base = `${m.home.name} vs ${m.away.name} · ${m.koDate} ${m.koTime} (FIN)`;
      const tip = m.note ? `${base} · ${m.note}` : base;
      const pick = m.winner ? undefined : picks[m.id];
      const next = m.id === nextId;
      const decided = !!m.winner;
      nodes.push({
        team: m.home, x: h.x, y: h.y, r: SIZE_OUTER, matchId: m.id, side: 'home', decided, next,
        advancing: m.winner === 'home', predicted: pick === 'home',
        tip: pick === 'home' ? `${tip} · your pick: ${m.home.name}` : tip,
      });
      nodes.push({
        team: m.away, x: a.x, y: a.y, r: SIZE_OUTER, matchId: m.id, side: 'away', decided, next,
        advancing: m.winner === 'away', predicted: pick === 'away',
        tip: pick === 'away' ? `${tip} · your pick: ${m.away.name}` : tip,
      });
    });
    return nodes;
  });

  /** Link between the two teams of each match — arc bulging outward */
  protected readonly matchLinks = computed<Link[]>(() => {
    const nextId = this.nextId();
    return this.matches().map((m, k) => {
      const homeA = (2 * k + PAIR_HOME) * (360 / 32);
      const awayA = (2 * k + PAIR_AWAY) * (360 / 32);
      const midA = (homeA + awayA) / 2;
      return {
        d: curve(R_OUTER, homeA, R_OUTER + 26, midA, R_OUTER, awayA),
        matchId: m.id, decided: !!m.winner, predicted: false, next: m.id === nextId,
      };
    });
  });

  /** Middle ring: 16 Round of 16 teams (R32 winners, your pick, or "?" if open) */
  protected readonly r16Nodes = computed<RNode[]>(() => {
    const picks = this.picks();
    return this.matches().map((m, k) => {
      const p = polar(R_R16, (k + 0.5) * (360 / 16));
      const w = winnerOf(m);
      const pickSide = w ? undefined : picks[m.id];
      const pick = pickSide ? (pickSide === 'home' ? m.home : m.away) : null;
      const team = w ?? pick;
      const tip = w
        ? `${w.name} → Round of 16`
        : pick
          ? `${pick.name} → Round of 16 (your pick)`
          : 'To be decided';
      return {
        team, x: p.x, y: p.y, r: SIZE_R16, matchId: m.id, side: null, decided: !!w, next: false,
        advancing: !!w, predicted: !!pick, tip,
      };
    });
  });

  /** R32 → R16 links — slight curve for a softer look */
  protected readonly r16Links = computed<Link[]>(() => {
    const picks = this.picks();
    return this.matches().map((m, k) => {
      const a = (k + 0.5) * (360 / 16);
      const rOut = R_OUTER - SIZE_OUTER - 5;
      const rIn = R_R16 + SIZE_R16 + 5;
      return {
        d: curve(rOut, a, (rOut + rIn) / 2, a + 5, rIn, a),
        matchId: m.id, decided: !!m.winner, predicted: !m.winner && !!picks[m.id], next: false,
      };
    });
  });

  /** Innermost ring: 8 Quarterfinal slots (TBD) */
  protected readonly qfNodes = computed<RNode[]>(() => {
    return Array.from({ length: 8 }, (_, j) => {
      const p = polar(R_QF, (j + 0.5) * (360 / 8));
      return {
        team: null, x: p.x, y: p.y, r: SIZE_QF, matchId: null, side: null, decided: false, next: false,
        advancing: false, predicted: false, tip: 'Quarterfinal — to be decided',
      };
    });
  });

  /** R16 → Quarterfinal links — converging curve (always dashed, not played yet) */
  protected readonly qfLinks = computed<Link[]>(() => {
    const links: Link[] = [];
    for (let k = 0; k < 16; k++) {
      const j = Math.floor(k / 2);
      const aIn = (k + 0.5) * (360 / 16);
      const aQf = (j + 0.5) * (360 / 8);
      const rIn = R_R16 - SIZE_R16 - 4;
      const rQf = R_QF + SIZE_QF + 4;
      links.push({
        d: curve(rIn, aIn, (rIn + rQf) / 2, (aIn + aQf) / 2, rQf, aQf),
        matchId: null, decided: false, predicted: false, next: false,
      });
    }
    return links;
  });

  protected flagUrl(team: Team): string {
    return `flags/${team.flag}.svg`;
  }

  protected isDimmed(matchId: number | null): boolean {
    const h = this.hovered();
    return h !== null && matchId !== null && h !== matchId;
  }

  protected onEnter(matchId: number | null): void {
    if (matchId !== null) this.hoverChange.emit(matchId);
  }

  protected onLeave(): void {
    this.hoverChange.emit(null);
  }

  protected onNodeClick(n: RNode): void {
    if (n.matchId !== null && !n.decided && n.side) {
      this.pickChange.emit({ matchId: n.matchId, side: n.side });
    }
  }
}
