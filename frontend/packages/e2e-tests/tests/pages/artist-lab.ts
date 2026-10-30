import {LegacyBlocklyLab} from './legacy-blockly-lab';

/** The Artist project lab. */
export class ArtistLab extends LegacyBlocklyLab {
  /** Create a new Artist project and wait for the lab. */
  async new(): Promise<void> {
    // domcontentloaded, not 'load': the lab is interactive long before all
    // subresources, and 'load' can exceed the test timeout on webkit.
    await this.page.goto('/projects/artist/new', {
      waitUntil: 'domcontentloaded',
    });
    await this.waitForReady();
  }
}
