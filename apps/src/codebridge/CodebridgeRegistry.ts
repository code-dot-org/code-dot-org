import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

export default class CodebridgeRegistry {
  private terminal: Terminal | null;
  private terminalFitAddon: FitAddon | null;

  private static _instance: CodebridgeRegistry;

  constructor() {
    this.terminal = null;
    this.terminalFitAddon = null;
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
}
