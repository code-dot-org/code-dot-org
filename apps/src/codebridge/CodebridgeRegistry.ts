import type {MiniApp} from '@code-dot-org/mini-app-base';
import ConsoleManager from '@codebridge/Console/ConsoleManager';

import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';

// Registry for Codebridge singletons that need to be accessed by
// multiple components/helper classes.
export default class CodebridgeRegistry {
  private consoleManager: ConsoleManager | null;
  private neighborhood: Neighborhood | null;
  private neighborhoodThumbnailScale: number | undefined;
  // Generic mini-app slot. Coexists with the legacy `neighborhood` slot
  // during the migration; once codebridge consumers route through here,
  // `setNeighborhood` / `getNeighborhood` will retire.
  private miniApp: MiniApp | null;

  private static _instance: CodebridgeRegistry;
  constructor() {
    this.consoleManager = null;
    this.neighborhood = null;
    this.neighborhoodThumbnailScale = undefined;
    this.miniApp = null;
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

  public setNeighborhood(neighborhood: Neighborhood | null) {
    this.neighborhood = neighborhood;
  }

  public getNeighborhood() {
    return this.neighborhood;
  }

  public setNeighborhoodThumbnailScale(scale: number | undefined) {
    this.neighborhoodThumbnailScale = scale;
  }

  public getNeighborhoodThumbnailScale() {
    return this.neighborhoodThumbnailScale;
  }

  public setMiniApp(miniApp: MiniApp | null) {
    this.miniApp = miniApp;
  }

  public getMiniApp(): MiniApp | null {
    return this.miniApp;
  }
}
