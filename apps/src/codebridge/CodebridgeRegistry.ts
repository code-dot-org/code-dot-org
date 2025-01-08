import ConsoleManager from '@codebridge/Console/ConsoleManager';

// Registry for Codebridge singletons that need to be accessed by
// multiple components/helper classes.
export default class CodebridgeRegistry {
  private consoleManager: ConsoleManager | null;

  private static _instance: CodebridgeRegistry;
  constructor() {
    this.consoleManager = null;
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

  public setConsoleManager(consoleManager: ConsoleManager) {
    this.consoleManager = consoleManager;
  }

  public getConsoleManager() {
    return this.consoleManager;
  }
}
