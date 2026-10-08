import type {Locator} from 'playwright/test';

/**
 * A set of player controls, driven the way a user would. The shared specs in
 * controls.spec.ts run once per implementation, so every behavior they cover
 * must work the same through the built-in controls and through any custom
 * controls built on the element's public interface.
 */
export interface ControlsDriver {
  readonly name: string;
  play(): Promise<void>;
  pause(): Promise<void>;
  mute(): Promise<void>;
  unmute(): Promise<void>;
  /** 0 to 1. */
  setVolume(volume: number): Promise<void>;
  /** 0 to 1 of the duration. */
  seekTo(fraction: number): Promise<void>;
  toggleCaptions(): Promise<void>;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  /** The play/pause button, named "Play" or "Pause" by state. */
  readonly playButton: Locator;
  /** The button that toggles captions; its aria-pressed is checked. */
  readonly captionsButton: Locator;
  /** The displayed current time, e.g. "0:03". */
  readonly currentTimeText: Locator;
}

/**
 * Controls found by role and accessible name inside `root`. Built-in and
 * custom controls use the same names, so both drivers share this class and
 * differ only in their root and in how they reveal hidden controls.
 */
export class ControlBar implements ControlsDriver {
  readonly name: string;
  readonly root: Locator;
  readonly currentTimeText: Locator;

  constructor(name: string, root: Locator, currentTimeText: Locator) {
    this.name = name;
    this.root = root;
    this.currentTimeText = currentTimeText;
  }

  get playButton(): Locator {
    return this.button('Play').or(this.button('Pause'));
  }

  get captionsButton(): Locator {
    return this.button('Captions');
  }

  /** Make the controls clickable; e.g. a bar that fades while playing. */
  protected async reveal(): Promise<void> {}

  /** Make the volume slider usable; e.g. one that expands on hover. */
  protected async revealVolume(): Promise<void> {
    await this.reveal();
  }

  protected button(name: string): Locator {
    return this.root.getByRole('button', {name, exact: true});
  }

  protected slider(name: string): Locator {
    return this.root.getByRole('slider', {name, exact: true});
  }

  protected async click(name: string): Promise<void> {
    await this.reveal();
    await this.button(name).click();
  }

  play = () => this.click('Play');
  pause = () => this.click('Pause');
  mute = () => this.click('Mute');
  unmute = () => this.click('Unmute');
  toggleCaptions = () => this.click('Captions');
  enterFullscreen = () => this.click('Enter full screen');
  exitFullscreen = () => this.click('Exit full screen');

  async setVolume(volume: number): Promise<void> {
    await this.revealVolume();
    await this.slider('Volume').fill(String(volume));
  }

  async seekTo(fraction: number): Promise<void> {
    await this.reveal();
    await this.slider('Seek').fill(String(fraction * 100));
  }
}
