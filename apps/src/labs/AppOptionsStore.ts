/**
 * The AppOptionsStore loads and stores the app options for the current level.
 */
import {AppOptions, ProjectType} from './types';

export class AppOptionsStore {
  currentAppOptions: AppOptions | null = null;

  constructor(appOptions: AppOptions) {
    this.loadAppOptions(appOptions);
  }

  // For now, we are just saving the data here from appOptions, which is sent on page load.
  // In the future, we will have an api so we can hot reload levels.
  loadAppOptions(appOptions: AppOptions) {
    this.currentAppOptions = appOptions;
  }

  // We get the standalone app on the frontend because channels are created for project-backed levels
  // without a project type.
  // Open question: can we move this logic to the backend? All of this information comes from the backend.
  getProjectType(): ProjectType | null {
    if (!this.currentAppOptions) {
      return null;
    }
    if (
      this.currentAppOptions.level &&
      this.currentAppOptions.level.projectType
    ) {
      return this.currentAppOptions.level.projectType;
    }
    switch (this.currentAppOptions.app) {
      case 'applab':
      case 'calc':
      case 'dance':
      case 'eval':
      case 'flappy':
      case 'gamelab':
      case 'javalab':
      case 'music':
      case 'thebadguys':
      case 'weblab':
        return this.currentAppOptions.app; // Pass through type exactly
      case 'turtle':
        if (
          this.currentAppOptions.skinId === 'elsa' ||
          this.currentAppOptions.skinId === 'anna'
        ) {
          return 'frozen';
        } else if (this.currentAppOptions.level.isK1) {
          return 'artist_k1';
        }
        return 'artist';
      case 'craft':
        if (this.currentAppOptions.level.isAgentLevel) {
          return 'minecraft_hero';
        } else if (this.currentAppOptions.level.isEventLevel) {
          return 'minecraft_designer';
        } else if (this.currentAppOptions.level.isConnectionLevel) {
          return 'minecraft_codebuilder';
        } else if (this.currentAppOptions.level.isAquaticLevel) {
          return 'minecraft_aquatic';
        }
        return 'minecraft_adventurer';
      case 'studio':
        if (this.currentAppOptions.level.useContractEditor) {
          return 'algebra_game';
        } else if (this.currentAppOptions.skinId === 'hoc2015') {
          if (this.currentAppOptions.droplet) {
            return 'starwars';
          } else {
            return 'starwarsblocks_hour';
          }
        } else if (this.currentAppOptions.skinId === 'iceage') {
          return 'iceage';
        } else if (this.currentAppOptions.skinId === 'infinity') {
          return 'infinity';
        } else if (this.currentAppOptions.skinId === 'gumball') {
          return 'gumball';
        } else if (this.currentAppOptions.level.isK1) {
          return 'playlab_k1';
        }
        return 'playlab';
      case 'bounce':
        if (this.currentAppOptions.skinId === 'sports') {
          return 'sports';
        } else if (this.currentAppOptions.skinId === 'basketball') {
          return 'basketball';
        }
        return 'bounce';
      case 'poetry':
        return this.currentAppOptions.level.standaloneAppName;
      case 'spritelab':
        return (
          this.currentAppOptions.level.standaloneAppName ||
          this.currentAppOptions.app
        );
      default:
        return null;
    }
  }
}
