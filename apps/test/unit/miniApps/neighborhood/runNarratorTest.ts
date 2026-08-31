import {NeighborhoodSignalType} from '@cdo/apps/miniApps/neighborhood/constants';
import NeighborhoodRunNarrator, {
  PainterPositions,
} from '@cdo/apps/miniApps/neighborhood/runNarrator';
import {NeighborhoodSignal} from '@cdo/apps/miniApps/neighborhood/types';

// How long one move animates at default speed.
const MOVE_MS = 700;
const MIN_GAP_MS = 1000;

// detail.id is typed number but Python sends "painter-1", so cast as the mini
// app does.
function signal(
  value: NeighborhoodSignalType,
  detail?: Record<string, unknown>
): NeighborhoodSignal {
  return {value, detail} as NeighborhoodSignal;
}

function move(direction = 'east', id = 'painter-1') {
  return signal(NeighborhoodSignalType.MOVE, {id, direction});
}

describe('NeighborhoodRunNarrator', () => {
  let narrator: NeighborhoodRunNarrator;
  let positions: PainterPositions;
  let spoken: string[];

  function region(): HTMLElement {
    return document.body.querySelector('[aria-live="polite"]') as HTMLElement;
  }

  // Text lands on a 0ms timer, so capture each utterance as it appears.
  function drain() {
    jest.advanceTimersByTime(0);
    const text = region().textContent;
    if (text) {
      spoken.push(text);
      region().textContent = '';
    }
  }

  // Advance in small steps so each scheduled utterance is observed.
  function tick(ms: number) {
    for (let i = 0; i < ms; i += 10) {
      jest.advanceTimersByTime(10);
      drain();
    }
  }

  beforeEach(() => {
    jest.useFakeTimers();
    spoken = [];
    positions = {
      getPegmanX: () => 7,
      getPegmanY: () => 2,
    };
    narrator = new NeighborhoodRunNarrator(() => positions);
  });

  afterEach(() => {
    // The region is shared by id, so drop it to isolate the next test.
    region()?.remove();
    jest.useRealTimers();
  });

  it('creates a polite atomic live region', () => {
    expect(region()).not.toBeNull();
    expect(region().getAttribute('aria-atomic')).toBe('true');
  });

  it('reports a straight walk once, then totals it', () => {
    // Four moves east at animation speed, then a paint ends the run.
    for (let i = 0; i < 4; i++) {
      narrator.onSignal(move('east'));
      tick(MOVE_MS);
    }
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    tick(MIN_GAP_MS);

    const all = spoken.join(' | ');
    expect(all).toContain('Painter moving east');
    expect(all).toContain('Painter painted red.');
    // Never four separate per-step announcements.
    expect(all).not.toMatch(/moved east 1 square/);
    expect(all).toMatch(/4 squares/);
  });

  it('does not repeat the total when a ping already reported it', () => {
    narrator.onSignal(move('east'));
    tick(MIN_GAP_MS);
    narrator.onSignal(signal(NeighborhoodSignalType.TAKE_PAINT, {}));
    tick(MIN_GAP_MS);

    const all = spoken.join(' | ');
    expect(all).toContain('Painter moving east.');
    expect(all).not.toContain('moved east 1 square');
  });

  it('starts a new run when the direction changes', () => {
    narrator.onSignal(move('east'));
    narrator.onSignal(move('east'));
    narrator.onSignal(move('north'));
    tick(MIN_GAP_MS * 3);

    const all = spoken.join(' | ');
    expect(all).toMatch(/east 2 squares|moving east, 2 squares/);
    expect(all).toContain('north');
  });

  it('merges a burst of actions into one utterance', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'blue'}));
    narrator.onSignal(signal(NeighborhoodSignalType.TAKE_PAINT, {}));
    narrator.onSignal(
      signal(NeighborhoodSignalType.TURN_LEFT, {direction: 'north'})
    );
    tick(MIN_GAP_MS * 2);

    // First spoken at once, the rest merged into one later utterance.
    expect(spoken.length).toBeLessThanOrEqual(2);
    const all = spoken.join(' ');
    expect(all).toContain('took a unit of paint.');
    expect(all).toContain('turned left, now facing north.');
  });

  it('names the resulting direction of a turn', () => {
    narrator.onSignal(
      signal(NeighborhoodSignalType.TURN_LEFT, {direction: 'west'})
    );
    tick(10);
    expect(spoken.join(' ')).toBe('Painter turned left, now facing west.');
  });

  it('announces where a painter starts, 1-based', () => {
    narrator.onSignal(
      signal(NeighborhoodSignalType.INITIALIZE_PAINTER, {
        id: 'painter-1',
        x: '0',
        y: '3',
        direction: 'east',
      })
    );
    tick(10);
    expect(spoken.join(' ')).toBe(
      'Painter started at row 4, column 1, facing east.'
    );
  });

  it('does not read hex digits aloud', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: '#ff0000'}));
    tick(10);
    expect(spoken.join(' ')).toContain('painted a custom color.');
  });

  it('ignores signals that only change what is drawn', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.HIDE_BUCKETS, {}));
    narrator.onSignal(signal(NeighborhoodSignalType.SHOW_PAINTER, {id: 'p'}));
    tick(MIN_GAP_MS);
    expect(spoken).toEqual([]);
  });

  it('summarizes the run at the end', () => {
    narrator.onSignal(
      signal(NeighborhoodSignalType.INITIALIZE_PAINTER, {
        id: 'painter-1',
        x: '0',
        y: '0',
        direction: 'east',
      })
    );
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    tick(MIN_GAP_MS * 3);
    spoken = [];

    narrator.endRun();
    tick(10);

    const summary = spoken.join(' ');
    expect(summary).toContain('Run finished.');
    expect(summary).toContain('Painted 2 squares.');
    expect(summary).toContain('Painter stopped at row 3, column 8.');
  });

  // The console's own announcements are off during a run, so its output is
  // read here instead -- after the summary, not over the narration.
  it('reads console output after the summary, not during the run', () => {
    narrator.onSignal(move('east'));
    narrator.onConsoleMessage('There is no more paint in the bucket.');
    tick(MIN_GAP_MS * 2);

    expect(spoken.join(' ')).not.toContain('no more paint');

    narrator.endRun();
    tick(10);

    const last = spoken[spoken.length - 1];
    expect(last).toContain('Run finished.');
    expect(last.indexOf('Run finished.')).toBeLessThan(
      last.indexOf('no more paint')
    );
  });

  it('ignores blank console spacer lines', () => {
    narrator.onConsoleMessage('');
    narrator.onConsoleMessage('   ');
    narrator.endRun();
    tick(10);

    expect(spoken.join(' ')).not.toContain('Console:');
  });

  it('says so when nothing was painted', () => {
    narrator.endRun();
    tick(10);
    expect(spoken.join(' ')).toContain('No squares painted.');
  });

  it('makes no claim about correctness', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    tick(MIN_GAP_MS);
    narrator.endRun();
    tick(10);
    // The level's own validation message covers pass/fail.
    expect(spoken.join(' ')).not.toMatch(/correct|right track|wrong|success/i);
  });

  it('goes quiet and starts over after a reset', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    tick(MIN_GAP_MS);
    narrator.reset();
    spoken = [];
    tick(MIN_GAP_MS * 2);
    expect(spoken).toEqual([]);

    // The next run does not inherit the old paint count.
    narrator.endRun();
    tick(10);
    expect(spoken.join(' ')).toContain('No squares painted.');
  });

  it('distinguishes painters only when there are several', () => {
    for (const id of ['painter-1', 'painter-2']) {
      narrator.onSignal(
        signal(NeighborhoodSignalType.INITIALIZE_PAINTER, {
          id,
          x: '0',
          y: '0',
          direction: 'east',
        })
      );
      tick(MIN_GAP_MS);
    }
    spoken = [];
    narrator.onSignal(move('east', 'painter-2'));
    tick(MIN_GAP_MS);
    expect(spoken.join(' ')).toContain('Painter 2 moving east');
  });
});
