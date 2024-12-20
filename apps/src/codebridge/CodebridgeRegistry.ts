import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

// TODO: Rather than having all these console-specific methods in the registry, we should
// instead make a ConsoleManager (combine with ConsoleHelpers) that manages all the console
// operations, and reference that singleton here.
export default class CodebridgeRegistry {
  private terminal: Terminal | null;
  private terminalFitAddon: FitAddon | null;
  private terminalLines: string[];

  private static _instance: CodebridgeRegistry;

  constructor() {
    this.terminal = null;
    this.terminalFitAddon = null;
    this.terminalLines = [];
  }

  public static getInstance(): CodebridgeRegistry {
    if (CodebridgeRegistry._instance === undefined) {
      CodebridgeRegistry.create();
    }
    return CodebridgeRegistry._instance;
  }

  public static create() {
    CodebridgeRegistry._instance = new CodebridgeRegistry();
  }

  public setTerminal(terminal: Terminal) {
    this.terminal = terminal;
  }

  public getTerminal() {
    return this.terminal;
  }

  public setTerminalFitAddon(terminalFitAddon: FitAddon) {
    this.terminalFitAddon = terminalFitAddon;
  }

  public getTerminalFitAddon() {
    return this.terminalFitAddon;
  }

  public appendTerminalLine(line: string) {
    this.terminalLines.push(line);
    if (this.terminal) {
      this.terminal.writeln(line);
      this.terminal.focus();
    }
  }

  public clearTerminalLines() {
    this.terminalLines = [];
    if (this.terminal) {
      this.terminal.clear();
    }
  }

  public getTerminalLines() {
    return this.terminalLines;
  }
}
