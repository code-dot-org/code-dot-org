// Registry for Lab singletons

import {Theme} from '@code-dot-org/component-library/common/contexts';

import UnifiedBackpackClientApi from '@cdo/apps/sharedComponents/backpack/UnifiedBackpackClientApi';

import LabMetricsReporter from './Lab2MetricsReporter';
import ProjectManager from './projects/ProjectManager';
import {AppName, LevelNavigationConfirmation} from './types';
import LifecycleNotifier from './utils/LifecycleNotifier';

export default class Lab2Registry {
  private projectManager: ProjectManager | null;
  private metricsReporter: LabMetricsReporter;
  private lifecycleNotifier: LifecycleNotifier;
  private appName: AppName | null;
  private theme: Theme | undefined;
  private levelNavigationConfirmation: LevelNavigationConfirmation | undefined;
  private unifiedBackpackApi: UnifiedBackpackClientApi | undefined;

  private static _instance: Lab2Registry;

  constructor() {
    this.projectManager = null;
    this.metricsReporter = new LabMetricsReporter();
    this.lifecycleNotifier = new LifecycleNotifier();
    this.appName = null;
    this.theme = undefined;
    this.levelNavigationConfirmation = undefined;
    this.unifiedBackpackApi = undefined;
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

  public getLifecycleNotifier() {
    return this.lifecycleNotifier;
  }

  public setAppName(appName: AppName) {
    this.appName = appName;
  }

  public getAppName() {
    return this.appName;
  }

  public setTheme(theme: Theme) {
    this.theme = theme;
  }

  public getTheme() {
    return this.theme;
  }

  public getLevelNavigationConfirmation() {
    return this.levelNavigationConfirmation;
  }

  public setLevelNavigationConfirmation(
    confirmation: LevelNavigationConfirmation | undefined
  ) {
    this.levelNavigationConfirmation = confirmation;
  }

  // The unified backpack spans every lab, so one client serves the whole page. It is
  // created on demand rather than set up by a lab, and holds the user's channels once
  // fetched, so callers should share this instance rather than construct their own.
  public getUnifiedBackpackApi() {
    if (!this.unifiedBackpackApi) {
      this.unifiedBackpackApi = new UnifiedBackpackClientApi();
    }
    return this.unifiedBackpackApi;
  }
}
