// Narrates the painter to a screen reader while a program runs.
//
// The keyboard cursor stands down during a run, so nothing else describes the
// grid. Speech is slower than the animation, so moves in one direction are
// counted instead of announced one by one, and utterances stay a second apart
// with anything arriving between them merged. Program output, errors and the
// level's pass/fail message already have live regions of their own.

import {NeighborhoodSignalType} from './constants';
import {NeighborhoodSignal} from './types';

const MIN_GAP_MS = 1000;
const REGION_ID = 'neighborhood-narration';

// Only read once a run has ended.
export interface PainterPositions {
  getPegmanX: (id?: string) => number | undefined;
  getPegmanY: (id?: string) => number | undefined;
}

// Visually hidden, still read aloud.
const SR_ONLY = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
};

// One region per page, so repeated mounts cannot pile up divs.
function liveRegion(): HTMLElement {
  const found = document.getElementById(REGION_ID);
  if (found) {
    return found;
  }
  const el = document.createElement('div');
  el.id = REGION_ID;
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  Object.assign(el.style, SR_ONLY);
  document.body.appendChild(el);
  return el;
}

// "Painter 1", not "painter-1".
function painterName(id: string): string {
  const numbered = /^painter-(\d+)$/.exec(id);
  return numbered ? `Painter ${numbered[1]}` : id;
}

// Spoken 1-based, as the keyboard cursor speaks them.
function position(col: number, row: number): string {
  return `row ${row + 1}, column ${col + 1}`;
}

function squares(n: number): string {
  return n === 1 ? '1 square' : `${n} squares`;
}

// Hex digits are unreadable aloud.
function paintPhrase(color: string | undefined): string {
  if (!color) {
    return 'painted.';
  }
  return color.startsWith('#')
    ? 'painted a custom color.'
    : `painted ${color}.`;
}

interface MoveRun {
  id: string;
  direction: string;
  count: number;
  // How far a ping already reported, so the closing total can skip a repeat.
  reported: number;
}

export default class NeighborhoodRunNarrator {
  private readonly getPositions: () => PainterPositions | null;
  private readonly region: HTMLElement;
  private pending: string[] = [];
  private run: MoveRun | null = null;
  private lastSpokenAt = 0;
  private timer: number | null = null;
  private painterIds: string[] = [];
  private painted = 0;
  // Console output held back so it does not talk over the narration. The
  // console's own announcements are off while a run is in flight; these are
  // read out after the closing summary instead of being lost.
  private consoleLines: string[] = [];

  constructor(getPositions: () => PainterPositions | null) {
    this.getPositions = getPositions;
    this.region = liveRegion();
  }

  onSignal({value, detail}: NeighborhoodSignal): void {
    const id = detail?.id === undefined ? '' : String(detail.id);
    switch (value) {
      case NeighborhoodSignalType.MOVE: {
        const direction = detail?.direction;
        if (!direction) {
          return;
        }
        // Still going the same way: just count it.
        if (this.run?.id === id && this.run.direction === direction) {
          this.run.count++;
          return;
        }
        this.reportMove(true);
        this.run = {id, direction, count: 1, reported: 0};
        this.schedule();
        return;
      }
      case NeighborhoodSignalType.INITIALIZE_PAINTER: {
        if (id && !this.painterIds.includes(id)) {
          this.painterIds.push(id);
        }
        const x = Number(detail?.x);
        const y = Number(detail?.y);
        const at =
          Number.isFinite(x) && Number.isFinite(y)
            ? ` at ${position(x, y)}`
            : '';
        const facing = detail?.direction ? `, facing ${detail.direction}` : '';
        return this.say(id, `started${at}${facing}.`);
      }
      case NeighborhoodSignalType.TURN_LEFT:
        // Python reports the direction the painter ends up facing.
        return this.say(
          id,
          detail?.direction
            ? `turned left, now facing ${detail.direction}.`
            : 'turned left.'
        );
      case NeighborhoodSignalType.PAINT:
        this.painted++;
        return this.say(id, paintPhrase(detail?.color));
      case NeighborhoodSignalType.REMOVE_PAINT:
        return this.say(id, 'scraped the paint off this square.');
      case NeighborhoodSignalType.TAKE_PAINT:
        return this.say(id, 'took a unit of paint.');
      default:
        // Showing and hiding sprites changes nothing a reader needs.
        return;
    }
  }

  // Program output, held until the narration is done. Blank spacer lines carry
  // nothing to say.
  onConsoleMessage(text: string): void {
    if (text.trim()) {
      this.consoleLines.push(text.trim());
    }
  }

  // Says what the run did. Makes no correctness claim: Painter levels have no
  // finish square, and the level's own verdict is announced elsewhere.
  endRun(): void {
    this.reportMove(true);
    const parts = ['Run finished.'];
    parts.push(
      this.painted ? `Painted ${squares(this.painted)}.` : 'No squares painted.'
    );
    const positions = this.getPositions();
    for (const id of this.painterIds) {
      const col = positions?.getPegmanX(id);
      const row = positions?.getPegmanY(id);
      if (typeof col === 'number' && typeof row === 'number') {
        parts.push(`${this.who(id).trim()} stopped at ${position(col, row)}.`);
      }
    }
    this.pending.push(parts.join(' '));
    // After the summary, so the run is described before its output is read.
    if (this.consoleLines.length) {
      this.pending.push(`Console: ${this.consoleLines.join(' ')}`);
      this.consoleLines = [];
    }
    this.speak();
  }

  // A stopped run must stop talking, and the next starts its counts over.
  reset(): void {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.pending = [];
    this.run = null;
    this.painterIds = [];
    this.painted = 0;
    this.consoleLines = [];
    this.region.textContent = '';
  }

  // Any other action closes an open move run.
  private say(id: string, phrase: string): void {
    this.reportMove(true);
    this.pending.push(`${this.who(id)}${phrase}`);
    this.schedule();
  }

  // Reports an open move run. A ping leaves it open so a long straight walk
  // says something while it happens; closing it names the distance covered.
  private reportMove(closing: boolean): void {
    const run = this.run;
    if (!run) {
      return;
    }
    if (closing) {
      this.run = null;
    }
    if (run.count === run.reported) {
      return;
    }
    run.reported = run.count;
    const far = run.count === 1 ? '' : `, ${squares(run.count)}`;
    this.pending.push(
      closing
        ? `${this.who(run.id)}moved ${run.direction} ${squares(run.count)}.`
        : `${this.who(run.id)}moving ${run.direction}${far}.`
    );
  }

  // Number the painter only when more than one is in play.
  private who(id: string): string {
    return this.painterIds.length > 1 && id
      ? `${painterName(id)} `
      : 'Painter ';
  }

  // Speak now if the last utterance is far enough behind, otherwise wait out
  // the gap and let whatever else arrives join this one.
  private schedule(): void {
    if (this.timer !== null) {
      return;
    }
    const wait = MIN_GAP_MS - (Date.now() - this.lastSpokenAt);
    if (wait <= 0) {
      this.speak();
      return;
    }
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.speak();
    }, wait);
  }

  private speak(): void {
    this.reportMove(false);
    if (!this.pending.length) {
      return;
    }
    const text = this.pending.join(' ');
    this.pending = [];
    this.lastSpokenAt = Date.now();
    // Clear first so repeated text still re-fires.
    this.region.textContent = '';
    window.setTimeout(() => {
      this.region.textContent = text;
    }, 0);
  }
}
