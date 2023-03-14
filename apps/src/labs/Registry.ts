import ProjectManager from './ProjectManager';

// Singleton for registering shared modules
export default class Registry {
  projectManager: ProjectManager;

  private static _instance: Registry;

  constructor(projectManager: ProjectManager) {
    if (Registry._instance) {
      throw new Error('Registry instance already initialized.');
    } else {
      Registry._instance = this;
    }

    this.projectManager = projectManager;
  }

  public static getInstance(): Registry {
    return Registry._instance;
  }
}
