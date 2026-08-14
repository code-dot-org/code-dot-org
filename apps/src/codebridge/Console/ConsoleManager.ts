import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

// Erase the screen (2J), the scrollback (3J), and home the cursor (H).
// Sent as a write rather than calling terminal.clear(): writes are queued and
// flushed asynchronously, while clear() edits the buffer immediately, so clear()
// silently leaves behind any line that has not been written out yet. As a write,
// the erase is applied in order with the lines around it.
const CLEAR_DISPLAY = '\x1b[2J\x1b[3J\x1b[H';

// Manager for xterm.js-based console in codebridge
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[];
  private inputBuffer: string;
  // If the last line in terminalLines is a partial line or not (i.e. if it was terminated with a newline).
  private lastLineIsPartial: boolean;
  // The message explaining that the coding environment could not be set up, if
  // it could not be. Unlike program output it stays true for the whole session,
  // so this manager owns writing it.
  private codeEnvironmentError: string | null;
  private terminalLinesListeners: ((lines: string[]) => void)[] = [];

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
    this.terminalLines = [];
    this.inputBuffer = '';
    this.lastLineIsPartial = false;
    this.codeEnvironmentError = null;
  }

  public getTerminal() {
    return this.terminal;
  }

  public getTerminalFitAddon() {
    return this.terminalFitAddon;
  }

  public setTerminal(terminal: Terminal) {
    this.terminal = terminal;
  }

  public setTerminalFitAddon(terminalFitAddon: FitAddon) {
    this.terminalFitAddon = terminalFitAddon;
  }

  public clearTerminalLines() {
    this.terminalLines = [];
    this.terminal.write(CLEAR_DISPLAY);
    this.lastLineIsPartial = false;
    this.executeTerminalLinesListeners();
    // The run button is still disabled and its tooltip still points here, so the
    // explanation has to come back with the empty console.
    if (this.codeEnvironmentError) {
      this.writeConsoleMessage(this.codeEnvironmentError, false);
    }
  }

  // Callers may report the same error as often as they like. The test for
  // "already printed" is the console's own contents rather than this manager's
  // state, because the error can reach the console without coming through here:
  // a re-created console replays the previous console's lines, error included.
  public setCodeEnvironmentError(error: string | null) {
    this.codeEnvironmentError = error;
    if (error && !this.terminalLines.some(line => line.includes(error))) {
      this.writeConsoleMessage(error, false);
    }
  }

  public getTerminalLines() {
    return this.terminalLines;
  }

  // Writing focuses the terminal so the user can type into a program that is
  // asking for input. Pass focusTerminal false for messages the user did not
  // ask for, which would otherwise pull focus out of whatever they are doing.
  public writeConsoleMessage(message: string, focusTerminal = true) {
    const lines = message.split('\n');
    lines.forEach(l => this.appendTerminalLine(l, focusTerminal));
  }

  public writePartialLine(message: string) {
    this.updateTerminalLines(message);
    this.lastLineIsPartial = true;
    this.terminal.write(message);
    this.terminal.scrollToBottom();
    this.terminal.focus();
  }

  public appendToInputBuffer(data: string) {
    this.inputBuffer += data;
  }

  public backspaceInputBuffer() {
    this.inputBuffer = this.inputBuffer.slice(0, -1);
  }

  public getInputBuffer() {
    return this.inputBuffer;
  }

  // Store the current input buffer in the terminal and clear the input buffer.
  // We always store the input buffer as a line with a newlne, because we clear it when
  // the user presses enter.
  public saveAndClearInputBuffer() {
    this.updateTerminalLines(this.inputBuffer);
    this.lastLineIsPartial = false;
    this.inputBuffer = '';
  }

  public addTerminalLinesListener(listener: (lines: string[]) => void) {
    this.terminalLinesListeners.push(listener);
  }

  public removeTerminalLinesListener(listener: (lines: string[]) => void) {
    this.terminalLinesListeners = this.terminalLinesListeners.filter(
      l => l !== listener
    );
  }

  private executeTerminalLinesListeners() {
    this.terminalLinesListeners.forEach(listener =>
      listener(this.terminalLines)
    );
  }

  private appendTerminalLine(line: string, focusTerminal = true) {
    this.updateTerminalLines(line);
    this.lastLineIsPartial = false;
    this.terminal.writeln(line);
    this.terminal.scrollToBottom();
    if (focusTerminal) {
      this.terminal.focus();
    }
  }

  private updateTerminalLines(message: string) {
    if (this.lastLineIsPartial && this.terminalLines.length > 0) {
      this.terminalLines[this.terminalLines.length - 1] += message;
    } else {
      this.terminalLines.push(message);
    }
    this.executeTerminalLinesListeners();
  }
}
