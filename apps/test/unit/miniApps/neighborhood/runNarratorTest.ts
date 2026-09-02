import {NeighborhoodSignalType} from '@cdo/apps/miniApps/neighborhood/constants';
import NeighborhoodRunNarrator, {
  PainterPositions,
} from '@cdo/apps/miniApps/neighborhood/runNarrator';
import {NeighborhoodSignal} from '@cdo/apps/miniApps/neighborhood/types';

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
  let consoleLines: string[];

  function region(): HTMLElement {
    return document.getElementById('neighborhood-run-log') as HTMLElement;
  }

  function utterances(): string[] {
    return Array.from(region().children).map(line => line.textContent ?? '');
  }

  function spoken(): string {
    return utterances().join(' ');
  }

  beforeEach(() => {
    positions = {getPegmanX: () => 7, getPegmanY: () => 2};
    consoleLines = [];
    narrator = new NeighborhoodRunNarrator(
      () => positions,
      () => consoleLines
    );
  });

  afterEach(() => {
    // The log is shared by id, so drop it to isolate the next test.
    region()?.parentElement?.remove();
  });

  // Reachable from a reader's landmark and heading lists, not only by chance.
  it('puts the log in a labelled region with a heading', () => {
    narrator.startRun();
    const labelledBy = region().parentElement?.getAttribute('aria-labelledby');

    expect(region().getAttribute('role')).toBe('log');
    expect(region().parentElement?.getAttribute('role')).toBe('region');
    expect(document.getElementById(labelledBy ?? '')?.textContent).toBe(
      'Run log'
    );
  });

  // Nothing visual changes, so the log has to stay out of the layout.
  it('hides the log from sight without hiding it from a reader', () => {
    narrator.startRun();
    const style = region().parentElement?.style;

    expect(style?.position).toBe('absolute');
    expect(style?.width).toBe('1px');
    expect(style?.overflow).toBe('hidden');
    expect(region().parentElement?.getAttribute('aria-hidden')).toBeNull();
  });

  it('says the program is running so pressing Run is not met with silence', () => {
    narrator.startRun();
    expect(utterances()).toEqual(['Program running.']);
  });

  // A dropped announcement costs nothing if the line is still there to read.
  it('logs each action as it happens', () => {
    narrator.onSignal(move('east'));
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));

    expect(utterances()).toEqual(['Moved east 1 square.', 'Painted red.']);
  });

  it('reports progress part-way through a long walk', () => {
    for (let i = 0; i < 5; i++) {
      narrator.onSignal(move('east'));
    }

    expect(utterances()).toEqual(['Moving east, 5 squares.']);
  });

  it('does not repeat a total that a progress report just gave', () => {
    for (let i = 0; i < 5; i++) {
      narrator.onSignal(move('east'));
    }
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));

    expect(utterances()).toEqual(['Moving east, 5 squares.', 'Painted red.']);
  });

  it('logs the run in order and ends with a summary', () => {
    narrator.onSignal(
      signal(NeighborhoodSignalType.INITIALIZE_PAINTER, {
        id: 'painter-1',
        x: '0',
        y: '3',
        direction: 'east',
      })
    );
    for (let i = 0; i < 4; i++) {
      narrator.onSignal(move('east'));
    }
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    narrator.onSignal(
      signal(NeighborhoodSignalType.TURN_LEFT, {direction: 'north'})
    );

    narrator.endRun();

    expect(utterances()).toEqual([
      'Painter started at row 4, column 1, facing east.',
      'Moved east 4 squares.',
      'Painted red.',
      'Turned left, now facing north.',
      'Run finished. Painter stopped at row 3, column 8.',
    ]);
  });

  // Turns group the way moves do, so turning right is one step, not three.
  it('counts a streak of turns rather than listing each', () => {
    // Three left turns is a right turn; only the direction faced at the end
    // matters.
    for (const direction of ['north', 'west', 'south']) {
      narrator.onSignal(
        signal(NeighborhoodSignalType.TURN_LEFT, {id: 'painter-1', direction})
      );
    }
    narrator.endRun();

    expect(spoken()).toContain('Turned left 3 times, now facing south.');
  });

  it('closes the run when the direction changes', () => {
    narrator.onSignal(move('east'));
    narrator.onSignal(move('east'));
    narrator.onSignal(move('north'));
    narrator.endRun();

    expect(spoken()).toContain('Moved east 2 squares. Moved north 1 square.');
  });

  it('does not read hex digits aloud', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: '#ff0000'}));
    narrator.endRun();

    expect(spoken()).toContain('Painted a custom color.');
  });

  it('ignores signals that only change what is drawn', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.HIDE_BUCKETS, {}));
    narrator.onSignal(signal(NeighborhoodSignalType.SHOW_PAINTER, {id: 'p'}));
    narrator.endRun();

    expect(utterances()).toEqual(['Run finished.']);
  });

  // The console is silent during a run, so its output is read here instead.
  it('reads the newest console line last', () => {
    consoleLines = Array.from({length: 8}, (_, i) => `line ${i + 1}`);
    narrator.endRun();

    expect(spoken()).toMatch(/Run finished\..*Console: line 8$/);
    expect(spoken()).not.toContain('line 7');
  });

  it('ignores blank console spacer lines', () => {
    consoleLines = ['', '   '];
    narrator.endRun();

    expect(spoken()).not.toContain('Console:');
  });

  // Previous runs are not kept.
  it('clears the log and starts its counts over on reset', () => {
    narrator.onSignal(signal(NeighborhoodSignalType.PAINT, {color: 'red'}));
    narrator.endRun();

    narrator.reset();
    expect(utterances()).toEqual([]);

    narrator.endRun();
    expect(spoken()).not.toContain('Painted red.');
  });

  it('names painters only when there are several', () => {
    for (const id of ['painter-1', 'painter-2']) {
      narrator.onSignal(
        signal(NeighborhoodSignalType.INITIALIZE_PAINTER, {
          id,
          x: '0',
          y: '0',
          direction: 'east',
        })
      );
    }
    narrator.onSignal(move('east', 'painter-2'));
    narrator.endRun();

    expect(spoken()).toContain('Painter 2 moved east 1 square.');
  });
});
