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

  async enqueueLevelChange(
    existingProject: Project,
    existingProjectManager: ProjectManager,
    levelId: number,
    scriptId?: number
  ) {
    if (!this.levelChangeInProgress) {
      console.log(
        `[DEBUGGING] Directly calling changeLevel for level ${levelId} and script ${scriptId}`
      );
      this.levelChangeInProgress = true;
      await this.changeLevel(
        existingProject,
        existingProjectManager,
        levelId,
        scriptId
      );
      this.levelChangeInProgress = false;
    } else {
      console.log(
        `[DEBUGGING] Enqueuing level change to level ${levelId} and script ${scriptId}`
      );
      this.enqueuedChanges.push({
        levelId,
        scriptId,
        existingProject,
        existingProjectManager,
      });
    }
  }

  async changeLevel(
    existingProject: Project,
    existingProjectManager: ProjectManager,
    levelId: number,
    scriptId?: number
  ) {
    console.log(
      `[DEBUGGING] In calling changeLevel for level ${levelId} and script ${scriptId}`
    );

    if (existingProjectManager.hasUnsavedChanges()) {
      console.log('triggering force save on change levels');
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
