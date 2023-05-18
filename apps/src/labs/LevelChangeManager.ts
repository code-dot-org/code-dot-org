/**
 * Class that handles clean up between level switches. Specifically,
 * it handles saving any unsaved project changes, destroying the project manager
 * once those saves are done, then calling out to a reset function provided by the lab.
 */

import ProjectManager from './projects/ProjectManager';
import {Project} from './types';

export default class LevelChangeManager {
  private handleLevelReset: LevelResetHandler;

  constructor(handleLevelReset: LevelResetHandler) {
    this.handleLevelReset = handleLevelReset;
  }

  /**
   * Change levels and handle level reset.
   * @param existingProject The current project to save before changing levels (if it has changed).
   * @param existingProjectManager The current project manager to clean up before changing levels.
   * @param levelId The level id of the new level.
   * @param scriptId The script id of the new level (optional).
   */
  async changeLevel(
    existingProject: Project,
    existingProjectManager: ProjectManager,
    levelId: number,
    scriptId?: number
  ) {
    if (existingProjectManager.hasUnsavedChanges()) {
      // Force a save with the current code before changing levels if there are unsaved changes.
      await existingProjectManager.save(existingProject, true);
    }
    // Clear out any remaining enqueud saves from the existing project manager.
    existingProjectManager.destroy();
    // Reset the level.
    await this.handleLevelReset(levelId, scriptId);
  }
}

type LevelResetHandler = (levelId: number, scriptId?: number) => Promise<void>;
