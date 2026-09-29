import type ConsoleManager from './console/ConsoleManager';

/**
 * Registry for Codebridge singletons that non-React code (e.g. a lab's code
 * runner running off the main React tree) needs to reach — currently just the
 * console manager. Ported and trimmed from apps/src/codebridge/CodebridgeRegistry.ts
 * (the neighborhood/theater miniapp holders are deferred with the miniapp port).
 *
 * A single shared instance, mirroring base `LabRegistry`.
 */
class CodebridgeRegistry {
  private consoleManager: ConsoleManager | null = null;

  public setConsoleManager(consoleManager: ConsoleManager | null) {
    this.consoleManager = consoleManager;
  }

  public getConsoleManager() {
    return this.consoleManager;
  }
}

export default new CodebridgeRegistry();
