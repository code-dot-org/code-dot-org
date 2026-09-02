// Narrates the painter to a screen reader as a run happens. Announcements are
// lossy -- a reader drops queued speech when the run button relabels itself --
// so every line also stays in a log the student can navigate back through.

import {SVG_ID} from '@cdo/apps/maze/constants';

import {NeighborhoodSignalType} from './constants';
import {NeighborhoodSignal} from './types';

const LOG_ID = 'neighborhood-run-log';
const HEADING_ID = 'neighborhood-run-log-heading';

// How far the painter walks between progress reports on one straight run.
const MOVES_PER_UPDATE = 5;

// A ceiling on DOM growth, past anything a readable run reaches.
const MAX_ENTRIES = 500;

// Only read once a run has ended.
export interface PainterPositions {
  getPegmanX: (id?: string) => number | undefined;
  getPegmanY: (id?: string) => number | undefined;
}

// Visually hidden, still in the accessibility tree.
const SR_ONLY = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
};

// A labelled region with a heading, so the log is reachable from a screen
// reader's landmark and heading lists rather than only by chance.
function buildLog(): HTMLElement {
  const region = document.createElement('div');
  region.setAttribute('role', 'region');
  region.setAttribute('aria-labelledby', HEADING_ID);
  Object.assign(region.style, SR_ONLY);

  const heading = document.createElement('h2');
  heading.id = HEADING_ID;
  heading.textContent = 'Run log';

  const log = document.createElement('div');
  log.id = LOG_ID;
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  region.append(heading, log);
  // Beside the grid rather than at the end of the document, so a reader
  // exploring the lab runs into it.
  const parent =
    document.getElementById(SVG_ID)?.parentElement ?? document.body;
  parent.appendChild(region);
  return log;
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

// A run of the same action repeated. Moves carry the direction travelled,
// turns the direction ended up facing.
interface Streak {
  kind: 'move' | 'turn';
  id: string;
  direction: string;
  count: number;
  // How far a progress report already got, so closing does not repeat it.
  reported: number;
}

export default class NeighborhoodRunNarrator {
  private readonly getPositions: () => PainterPositions | null;
  private readonly getConsoleLines: () => string[];
  private streak: Streak | null = null;
  private painterIds: string[] = [];

  constructor(
    getPositions: () => PainterPositions | null,
    // The console is silent during a run, so its newest line is read out with
    // the summary. Covers system messages, which never reach a signal.
    getConsoleLines: () => string[] = () => []
  ) {
    this.getPositions = getPositions;
    this.getConsoleLines = getConsoleLines;
  }

  // Fills the silence after Run is pressed.
  startRun(): void {
    this.announce('Program running.');
  }

  // Keeps the log: what the painter managed before being stopped is the point.
  // Said here because re-enabling the console's own would move focus.
  stopRun(): void {
    this.closeStreak();
    this.announce('Program stopped.');
  }

  onSignal({value, detail}: NeighborhoodSignal): void {
    const id = detail?.id === undefined ? '' : String(detail.id);
    switch (value) {
      case NeighborhoodSignalType.MOVE: {
        const direction = detail?.direction;
        if (!direction) {
          return;
        }
        // Still going the same way: count it, and report every so many squares
        // so a long walk says something as it happens.
        if (
          this.streak?.kind === 'move' &&
          this.streak.id === id &&
          this.streak.direction === direction
        ) {
          this.streak.count++;
          if (this.streak.count % MOVES_PER_UPDATE === 0) {
            this.streak.reported = this.streak.count;
            const far = squares(this.streak.count);
            this.record(id, `moving ${direction}, ${far}.`);
          }
          return;
        }
        this.closeStreak();
        this.streak = {kind: 'move', id, direction, count: 1, reported: 0};
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
        // Always named: this is the line that introduces the painter.
        this.closeStreak();
        this.announce(`${this.name(id)} started${at}${facing}.`);
        return;
      }
      case NeighborhoodSignalType.TURN_LEFT: {
        // Python reports the direction the painter ends up facing, so a streak
        // of turns keeps only the last one.
        const facing = detail?.direction ?? '';
        if (this.streak?.kind === 'turn' && this.streak.id === id) {
          this.streak.count++;
          this.streak.direction = facing;
          return;
        }
        this.closeStreak();
        this.streak = {
          kind: 'turn',
          id,
          direction: facing,
          count: 1,
          reported: 0,
        };
        return;
      }
      case NeighborhoodSignalType.PAINT:
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

  // Makes no correctness claim: Painter levels have no finish square, and the
  // level's own verdict is announced elsewhere.
  endRun(): void {
    this.closeStreak();
    const parts = ['Run finished.'];
    const positions = this.getPositions();
    for (const id of this.painterIds) {
      const col = positions?.getPegmanX(id);
      const row = positions?.getPegmanY(id);
      if (typeof col === 'number' && typeof row === 'number') {
        parts.push(`${this.name(id)} stopped at ${position(col, row)}.`);
      }
    }
    // Newest line only: the rest stay on the console to be read there.
    const output = this.getConsoleLines()
      .map(line => line.trim())
      .filter(Boolean);
    const newest = output[output.length - 1];
    if (newest) {
      parts.push(`Console: ${newest}`);
    }
    this.announce(parts.join(' '));
  }

  // The log covers the run in hand, so each run starts it over.
  reset(): void {
    this.streak = null;
    this.painterIds = [];
    this.log().replaceChildren();
  }

  // Any other action ends an open streak.
  private say(id: string, phrase: string): void {
    this.closeStreak();
    this.record(id, phrase);
  }

  // Named only when there is more than one painter, so a single-painter log
  // does not repeat it on every line.
  private record(id: string, phrase: string): void {
    this.announce(
      this.painterIds.length > 1
        ? `${this.name(id)} ${phrase}`
        : phrase.charAt(0).toUpperCase() + phrase.slice(1)
    );
  }

  // Ends an open streak, recording how far or how many times it went.
  private closeStreak(): void {
    const streak = this.streak;
    if (!streak) {
      return;
    }
    this.streak = null;
    const {kind, direction, count} = streak;
    if (count === streak.reported) {
      return;
    }
    if (kind === 'move') {
      this.record(streak.id, `moved ${direction} ${squares(count)}.`);
      return;
    }
    const times = count === 1 ? 'turned left' : `turned left ${count} times`;
    this.record(
      streak.id,
      direction ? `${times}, now facing ${direction}.` : `${times}.`
    );
  }

  // By id, not by how many painters exist yet: naming by count would call the
  // same painter two different things as the log grows.
  private name(id: string): string {
    return id ? painterName(id) : 'Painter';
  }

  // Built on first use: the grid it sits beside does not exist until the level
  // has been injected.
  private log(): HTMLElement {
    return document.getElementById(LOG_ID) ?? buildLog();
  }

  // One node per line, so the reader queues them and the line stays readable
  // afterwards whether or not it was announced.
  private announce(text: string): void {
    const log = this.log();
    const line = document.createElement('div');
    line.textContent = text;
    log.appendChild(line);
    while (log.childElementCount > MAX_ENTRIES) {
      log.firstElementChild?.remove();
    }
  }
}
