import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

// Manager for xterm.js-based console in codebridge
export default class ConsoleManager {
  private terminal: Terminal;
  private terminalFitAddon: FitAddon;
  private terminalLines: string[];

  private IMAGE_WIDTH = 400;
  private IMAGE_HEIGHT = 400;

  constructor(terminal: Terminal, terminalFitAddon: FitAddon) {
    this.terminal = terminal;
    this.terminalFitAddon = terminalFitAddon;
    this.terminalLines = [];
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
  }

  public getTerminalLines() {
    return this.terminalLines;
  }

  public writeConsoleMessage(message: string) {
    const lines = message.split('\n');
    lines.forEach(l => this.appendTerminalLine(l));
  }

  public writeSystemMessage(message: string, appName?: string) {
    this.writeConsoleMessage(this.getSystemMessage(message, appName));
  }

  public writeErrorMessage(message: string) {
    // This colors the message red in the terminal
    this.writeConsoleMessage(`\x1b[31m${message}\x1b[0m`);
  }

  public writeSystemError(message: string, appName: string) {
    this.writeErrorMessage(this.getSystemMessage(message, appName));
  }

  public writeImage(base64Image: string) {
    const dataSize = atob(base64Image).length;
    // This is a special sequence that tells the terminal to display an image
    // See documentation here: https://iterm2.com/documentation-images.html
    const imageString = `\x1b]1337;File=inline=1;size=${dataSize};width=${this.IMAGE_WIDTH}px;height=${this.IMAGE_HEIGHT}px:${base64Image}\x1b\\`;
    this.appendTerminalLine(imageString);
  }

  private appendTerminalLine(line: string) {
    this.terminalLines.push(line);
    this.terminal.writeln(line);
    this.terminal.scrollToBottom();
    this.terminal.focus();
  }

  private getSystemMessage(message: string, appName?: string) {
    const systemMessagePrefix = appName === 'pythonlab' ? '[PYTHON LAB] ' : '';
    return `${systemMessagePrefix}${message}`;
  }
}
