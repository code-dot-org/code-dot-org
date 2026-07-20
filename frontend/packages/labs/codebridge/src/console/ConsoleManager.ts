import type {FitAddon} from '@xterm/addon-fit';
import type {Terminal} from '@xterm/xterm';

/**
 * Manager for the xterm.js-based Codebridge console. Owns the terminal, tracks
 * the emitted lines (so they can be replayed when the terminal is recreated),
 * and buffers user input until Enter. Ported from
 * apps/src/codebridge/Console/ConsoleManager.ts.
 */
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[] = [];
  private inputBuffer = '';
  // Whether the last stored line is partial (not terminated with a newline).
  private lastLineIsPartial = false;
  private terminalLinesListeners: ((lines: string[]) => void)[] = [];

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
  }

  public getTerminal() {
    return this.terminal;
  }

  public getTerminalFitAddon() {
    return this.terminalFitAddon;
  }

  public clearTerminalLines() {
    this.terminalLines = [];
    this.terminal.clear();
    this.lastLineIsPartial = false;
    this.executeTerminalLinesListeners();
  }

  public getTerminalLines() {
    return this.terminalLines;
  }

  /** Write a program message, splitting on newlines into complete lines. */
  public writeConsoleMessage(message: string) {
    message.split('\n').forEach(line => this.appendTerminalLine(line));
  }

  /** Write output that is not newline-terminated (e.g. an input prompt). */
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

  /**
   * Store the current input buffer as a completed terminal line and clear it.
   * Called when the user presses Enter.
   */
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
      l => l !== listener,
    );
  }

  private executeTerminalLinesListeners() {
    this.terminalLinesListeners.forEach(listener =>
      listener(this.terminalLines),
    );
  }

  private appendTerminalLine(line: string) {
    this.updateTerminalLines(line);
    this.lastLineIsPartial = false;
    this.terminal.writeln(line);
    this.terminal.scrollToBottom();
    this.terminal.focus();
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
