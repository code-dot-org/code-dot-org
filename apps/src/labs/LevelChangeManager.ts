/**
 * Class that handles clean up between level switches. Specifically,
 * it handles saving any unsaved project changes, destroying the project manager
 * once those saves are done, then calling out to a reset function provided by the lab.
 * If a level switch is already in progress while another is requested, the second
 * level switch will be enqueued and will happen after the first level switch is complete.
 */

import ProjectManager from './projects/ProjectManager';
import {Project} from './types';

export default class LevelChangeManager {
  private enqueuedChanges: LevelChangeData[] = [];
  private handleLevelReset: LevelResetHandler;
  private levelChangeInProgress: boolean;

  constructor(handleLevelReset: LevelResetHandler) {
    this.handleLevelReset = handleLevelReset;
    this.levelChangeInProgress = false;
  }

  /**
   * Enqueue a level change. If no level change is in progress,
   * the level change will happen immediately. If a level change is in progress,
   * this level change will be enqued and will happen after all other enqueued level
   * changes have completed.
   * @param existingProject The current project to save before changing levels (if it has changed).
   * @param existingProjectManager The current project manager to clean up before changing levels.
   * @param levelId The level id of the new level.
   * @param scriptId The script id of the new level (optional).
   */
  async enqueueLevelChange(
    existingProject: Project,
    existingProjectManager: ProjectManager,
    levelId: number,
    scriptId?: number
  ) {
    if (!this.levelChangeInProgress) {
      this.levelChangeInProgress = true;
      await this.changeLevel(
        existingProject,
        existingProjectManager,
        levelId,
        scriptId
      );
      this.levelChangeInProgress = false;
    } else {
      this.enqueuedChanges.push({
        levelId,
        scriptId,
        existingProject,
        existingProjectManager,
      });
    }
  }

  /**
   * Helper function to change levels. This function should only be called by enqueueLevelChange,
   * or by itself if there are enqueued level changes.
   * @param existingProject The current project to save before changing levels (if it has changed).
   * @param existingProjectManager The current project manager to clean up before changing levels.
   * @param levelId The level id of the new level.
   * @param scriptId The script id of the new level (optional).
   */
  private async changeLevel(
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
    // If another level change has been enqueued in the meantime, handle it now.
    if (this.enqueuedChanges.length > 0) {
      const nextChange = this.enqueuedChanges.shift();
      if (nextChange) {
        await this.changeLevel(
          nextChange.existingProject,
          nextChange.existingProjectManager,
          nextChange.levelId,
          nextChange.scriptId
        );
      }
    }
  }
}

type LevelResetHandler = (levelId: number, scriptId?: number) => Promise<void>;

interface LevelChangeData {
  levelId: number;
  scriptId: number | undefined;
  existingProject: Project;
  existingProjectManager: ProjectManager;
}
