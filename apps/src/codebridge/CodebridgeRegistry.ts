import type {MiniApp} from '@code-dot-org/mini-app-base';
import ConsoleManager from '@codebridge/Console/ConsoleManager';

// Registry for Codebridge singletons that need to be accessed by
// multiple components/helper classes.
export default class CodebridgeRegistry {
  private consoleManager: ConsoleManager | null;
  private miniApp: MiniApp | null;
  private miniAppPreviewScale: number | undefined;

  private static _instance: CodebridgeRegistry;
  constructor() {
    this.consoleManager = null;
    this.miniApp = null;
    this.miniAppPreviewScale = undefined;
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

  public setMiniApp(miniApp: MiniApp | null) {
    this.miniApp = miniApp;
  }

  public getMiniApp(): MiniApp | null {
    return this.miniApp;
  }

  public setMiniAppPreviewScale(scale: number | undefined) {
    this.miniAppPreviewScale = scale;
  }

  public getMiniAppPreviewScale() {
    return this.miniAppPreviewScale;
  }
}
