// Registry for Lab singletons

import ProjectManager from './projects/ProjectManager';

export default class LabRegistry {
  projectManager: ProjectManager | null;
  private static _instance: LabRegistry;

  constructor() {
    this.projectManager = null;
  }

  public static getInstance(): LabRegistry {
    if (LabRegistry._instance === undefined) {
      LabRegistry.create();
    }
    return LabRegistry._instance;
  }

  public static hasEnabledProjects() {
    return (
      LabRegistry._instance !== undefined &&
      LabRegistry._instance.projectManager !== null
    );
  }

  public static create() {
    LabRegistry._instance = new LabRegistry();
  }

  public setProjectManager(projectManager: ProjectManager) {
    this.projectManager = projectManager;
  }

  public getProjectManager() {
    return this.projectManager;
  }

  public clearProjectManager() {
    this.projectManager = null;
  }
}
