import {flappyLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for the Flappy lab.
 * Flappy uses a standalone /flappy/{N} route and shows its congrats inside a
 * modal rather than the default overlay.
 * Extends LegacyBlocklyLab with Flappy-specific game-event methods.
 */
export class Flappy extends LegacyBlocklyLab {
  protected override get congratsSelector(): string {
    return '.modal .congrats';
  }

  protected buildLevelUrl(level: number): string {
    return flappyLevelUrl(level);
  }

  /**
   * Simulate a mouse-down (bird flap) event in the Flappy game.
   * Equivalent to: evaluate JavaScript expression "Flappy.onMouseDown(), true;"
   */
  async flap(): Promise<void> {
    await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Flappy.onMouseDown();
    });
  }

  /**
   * Override the Flappy gravity constant.
   * Setting gravity to a negative value (e.g. -1) makes the bird float upward,
   * passing all pipes and triggering level completion in one flap.
   *
   * @param value - value to assign to Flappy.gravity
   */
  async setGravity(value: number): Promise<void> {
    await this.page.evaluate(v => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).Flappy.gravity = v;
    }, value);
  }
}
