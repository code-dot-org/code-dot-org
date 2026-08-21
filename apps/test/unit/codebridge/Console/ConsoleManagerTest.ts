import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

import ConsoleManager from '@cdo/apps/codebridge/Console/ConsoleManager';

const ENVIRONMENT_ERROR = '[PYTHON LAB] Something is blocking Python Lab.';

const newConsoleManager = () =>
  new ConsoleManager(
    new Terminal({cols: 80, rows: 24, convertEol: true}),
    new FitAddon()
  );

const errorLines = (consoleManager: ConsoleManager) =>
  consoleManager
    .getTerminalLines()
    .filter(line => line.includes(ENVIRONMENT_ERROR));

// Reads the screen once everything written before this point has been parsed.
const readScreen = (consoleManager: ConsoleManager) =>
  new Promise<string>(resolve => {
    const terminal = consoleManager.getTerminal();
    terminal.write('', () => {
      const buffer = terminal.buffer.active;
      const lines: string[] = [];
      for (let i = 0; i < buffer.length; i++) {
        lines.push(buffer.getLine(i)?.translateToString(true) ?? '');
      }
      resolve(lines.join('\n'));
    });
  });

// The manager gives the terminal one chunk at a time and queues the rest, so a
// few rounds may be needed before all of it has reached the screen. Anything
// these tests queue fits in far fewer rounds than this.
const DRAIN_ROUNDS = 5;

// What is actually on screen -- which can disagree with getTerminalLines(),
// the point of the tests that use it.
const displayedText = async (consoleManager: ConsoleManager) => {
  let screen = '';
  for (let round = 0; round < DRAIN_ROUNDS; round++) {
    screen = await readScreen(consoleManager);
  }
  return screen;
};

// A terminal that acknowledges writes only when the test says so, so that a
// backlog can be built up on demand.
const stalledTerminal = () => {
  const acknowledgements: (() => void)[] = [];
  const terminal = {
    write: jest.fn((data: string, done?: () => void) => {
      if (done) {
        acknowledgements.push(done);
      }
    }),
    scrollToBottom: jest.fn(),
    focus: jest.fn(),
  };
  return {
    terminal,
    consoleManager: new ConsoleManager(
      terminal as unknown as Terminal,
      new FitAddon()
    ),
    // Acknowledge every outstanding write, which lets the manager send more.
    acknowledgeWrites: () => acknowledgements.splice(0).forEach(done => done()),
    writtenData: () => terminal.write.mock.calls.map(call => call[0]),
  };
};

const occurrences = (text: string, search: string) =>
  text.split(search).length - 1;

describe('ConsoleManager', () => {
  it('prints the code environment error once, however often it is reported', () => {
    const consoleManager = newConsoleManager();

    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    expect(errorLines(consoleManager)).toHaveLength(1);
  });

  // The case a re-created console lands in: the error is already among the lines
  // replayed from the previous console, so this manager has never printed it.
  it('does not reprint an error that is already in the console', () => {
    const consoleManager = newConsoleManager();
    consoleManager.writeConsoleMessage(`program output\n${ENVIRONMENT_ERROR}`);

    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    expect(errorLines(consoleManager)).toHaveLength(1);
  });

  it('reprints the code environment error after the console is cleared', () => {
    const consoleManager = newConsoleManager();
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);
    consoleManager.writeConsoleMessage('program output');

    consoleManager.clearTerminalLines();

    expect(consoleManager.getTerminalLines()).toEqual([ENVIRONMENT_ERROR]);
  });

  it('clears output written just before the clear', async () => {
    const consoleManager = newConsoleManager();
    consoleManager.writeConsoleMessage('program output');

    consoleManager.clearTerminalLines();

    expect(await displayedText(consoleManager)).not.toContain('program output');
  });

  // A level change clears twice in quick succession, on load start and on load
  // complete, with the error reprinted in between each time.
  it('shows one copy of the error after clearing twice in a row', async () => {
    const consoleManager = newConsoleManager();
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    consoleManager.clearTerminalLines();
    consoleManager.clearTerminalLines();

    const displayed = await displayedText(consoleManager);
    expect(occurrences(displayed, 'blocking Python Lab')).toBe(1);
  });

  it('drops half-typed input when the console is cleared', () => {
    const consoleManager = newConsoleManager();
    consoleManager.writePartialLine('What is your name? ');
    consoleManager.echoInput('Ada');

    consoleManager.clearTerminalLines();

    expect(consoleManager.getInputBuffer()).toBe('');
  });

  it('stops reprinting once the error is retracted', () => {
    const consoleManager = newConsoleManager();
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    consoleManager.setCodeEnvironmentError(null);
    consoleManager.clearTerminalLines();

    expect(consoleManager.getTerminalLines()).toEqual([]);
  });

  // The environment turned out to work after all, so the explanation is no longer
  // true and has to come off the screen.
  it('takes the error off the console when it is retracted', async () => {
    const consoleManager = newConsoleManager();
    consoleManager.writeConsoleMessage('program output');
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    consoleManager.setCodeEnvironmentError(null);

    expect(consoleManager.getTerminalLines()).toEqual(['program output']);
    const displayed = await displayedText(consoleManager);
    expect(displayed).not.toContain('blocking Python Lab');
    expect(displayed).toContain('program output');
  });

  it('keeps a half-typed input line when the error is retracted', async () => {
    const consoleManager = newConsoleManager();
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);
    consoleManager.writePartialLine('What is your name? ');
    consoleManager.echoInput('Ada');

    consoleManager.setCodeEnvironmentError(null);

    const displayed = await displayedText(consoleManager);
    expect(displayed).not.toContain('blocking Python Lab');
    expect(displayed).toContain('What is your name? Ada');
  });

  // The terminal throws "write data discarded" once 50MB of writes are waiting
  // to be parsed, so it is never given a second write before the first lands.
  it('gives the terminal one write at a time', () => {
    const {consoleManager, writtenData, acknowledgeWrites} = stalledTerminal();

    for (let line = 0; line < 100; line++) {
      consoleManager.writeConsoleMessage(`line ${line}`);
    }

    expect(writtenData()).toEqual(['line 0\r\n']);
    acknowledgeWrites();
    expect(writtenData()).toHaveLength(2);
    expect(writtenData()[1]).toContain('line 99');
  });

  it('drops output once the queue is full rather than piling it up', () => {
    const {consoleManager, writtenData, acknowledgeWrites} = stalledTerminal();
    const oneMegabyteLine = 'x'.repeat(1_000_000);

    for (let line = 0; line < 20; line++) {
      consoleManager.writeConsoleMessage(oneMegabyteLine);
    }

    const queuedCharacters = writtenData().join('').length;
    expect(queuedCharacters).toBeLessThan(2_000_000);
    acknowledgeWrites();
    expect(writtenData().join('').length).toBeLessThan(6_000_000);
  });

  it('reports dropped output once the console has caught up', () => {
    const {consoleManager, writtenData, acknowledgeWrites} = stalledTerminal();
    const oneMegabyteLine = 'x'.repeat(1_000_000);

    for (let line = 0; line < 20; line++) {
      consoleManager.writeConsoleMessage(oneMegabyteLine);
    }
    acknowledgeWrites();
    acknowledgeWrites();

    expect(writtenData().join('')).toContain(
      'characters of output were dropped'
    );
  });

  // Both echo and program output used to reach xterm by separate routes, which
  // let a typed character overtake output printed before it.
  it('echoes typed characters behind output printed before them', () => {
    const {consoleManager, writtenData, acknowledgeWrites} = stalledTerminal();
    consoleManager.writePartialLine('first output');
    consoleManager.writeConsoleMessage('queued output');

    consoleManager.echoInput('A');
    acknowledgeWrites();

    const secondWrite = writtenData()[1];
    expect(secondWrite.indexOf('A')).toBeGreaterThan(
      secondWrite.indexOf('queued output')
    );
  });

  it('does not write output that was cleared before it was sent', () => {
    const {consoleManager, writtenData, acknowledgeWrites} = stalledTerminal();
    consoleManager.writeConsoleMessage('first line');
    consoleManager.writeConsoleMessage('queued line');

    consoleManager.clearTerminalLines();
    acknowledgeWrites();

    expect(writtenData().join('')).not.toContain('queued line');
  });

  it('does nothing when retracting an error that was never reported', async () => {
    const consoleManager = newConsoleManager();
    consoleManager.writeConsoleMessage('program output');

    consoleManager.setCodeEnvironmentError(null);

    expect(consoleManager.getTerminalLines()).toEqual(['program output']);
    expect(await displayedText(consoleManager)).toContain('program output');
  });
});
