import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** A standalone App Lab project (/projects/applab/new), not a lesson level. */
export class ApplabLab extends LegacyBlocklyLab {
  /** Create a new project and wait for the lab to be interactive. */
  async gotoNewProject(): Promise<void> {
    await this.page.goto('/projects/applab/new', {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForReady();
  }
}
