// Registry for Lab singletons

import ProjectManager from './projects/ProjectManager';

export default class Lab2Registry {
  projectManager: ProjectManager | null;
  private static _instance: Lab2Registry;

  constructor() {
    this.projectManager = null;
  }

  public static getInstance(): Lab2Registry {
    if (Lab2Registry._instance === undefined) {
      Lab2Registry.create();
    }
    return Lab2Registry._instance;
  }

  public static hasEnabledProjects() {
    return (
      Lab2Registry._instance !== undefined &&
      Lab2Registry._instance.projectManager !== null
    );
  }

  public static create() {
    Lab2Registry._instance = new Lab2Registry();
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
