import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

// Manager for xterm.js-based console in codebridge
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[];
  private inputBuffer: string;
  // If the last line in terminalLines is a partial line or not (i.e. if it was terminated with a newline).
  private lastLineIsPartial: boolean;
  private terminalLinesListeners: ((lines: string[]) => void)[] = [];

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
    this.terminalLines = [];
    this.inputBuffer = '';
    this.lastLineIsPartial = false;
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
    this.terminal.clear();
    this.lastLineIsPartial = false;
    this.executeTerminalLinesListeners();
  }

  public getTerminalLines() {
    return this.terminalLines;
  }

  public writeConsoleMessage(message: string) {
    const lines = message.split('\n');
    lines.forEach(l => this.appendTerminalLine(l));
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
