import ConsoleManager from '@codebridge/Console/ConsoleManager';

import AiTutor from '@cdo/apps/lab2/ai/AiTutorManager';
import Neighborhood from '@cdo/apps/miniApps/neighborhood/Neighborhood';

// Registry for Codebridge singletons that need to be accessed by
// multiple components/helper classes.
export default class CodebridgeRegistry {
  private consoleManager: ConsoleManager | null;
  private neighborhood: Neighborhood | null;
  //private aiTutor: AiTutor | null;

  private static _instance: CodebridgeRegistry;
  constructor() {
    this.consoleManager = null;
    this.neighborhood = null;
    //this.aiTutor = null;
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

  /*
  public setAiTutor(aiTutor: AiTutor | null) {
    this.aiTutor = aiTutor;
  }

  public getAiTutor() {
    return this.aiTutor;
  }
  */
}
