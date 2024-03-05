// Registry for Lab singletons

import LabMetricsReporter from './Lab2MetricsReporter';
import ProjectManager from './projects/ProjectManager';

export default class Lab2Registry {
  private projectManager: ProjectManager | null;
  private metricsReporter: LabMetricsReporter;

  private static _instance: Lab2Registry;

  constructor() {
    this.projectManager = null;
    this.metricsReporter = new LabMetricsReporter();
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

  public getMetricsReporter() {
    return this.metricsReporter;
  }
}
