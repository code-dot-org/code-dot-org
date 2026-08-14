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

// What is actually on screen. Writes are queued, so this waits for them to flush
// -- and it can disagree with getTerminalLines(), which is the point of the tests
// that use it.
const displayedText = (consoleManager: ConsoleManager) =>
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

  it('stops reprinting once the error is retracted', () => {
    const consoleManager = newConsoleManager();
    consoleManager.setCodeEnvironmentError(ENVIRONMENT_ERROR);

    consoleManager.setCodeEnvironmentError(null);
    consoleManager.clearTerminalLines();

    expect(consoleManager.getTerminalLines()).toEqual([]);
  });
});
