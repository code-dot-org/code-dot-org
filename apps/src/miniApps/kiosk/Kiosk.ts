import MiniApp from '@cdo/apps/miniApps/MiniApp';

import {KioskSignalType} from './constants';
import {KioskScene} from './types';

interface KioskSignal {
  value: string;
  detail: KioskScene;
}

// Holds the screen a kiosk program published and hands it to whatever is
// rendering it. Each scene carries the screen's whole state, so a new one
// replaces the last rather than adding to it.
export default class Kiosk extends MiniApp {
  private readonly onSceneChange: (scene: KioskScene | null) => void;
  private scene: KioskScene | null;

  constructor(onSceneChange: (scene: KioskScene | null) => void) {
    super();
    this.onSceneChange = onSceneChange;
    this.scene = null;
  }

  handleSignal(signal: KioskSignal) {
    if (signal.value === KioskSignalType.SCENE) {
      this.scene = signal.detail;
      this.onSceneChange(this.scene);
    }
  }

  reset() {
    this.scene = null;
    this.onSceneChange(null);
  }

  onStop() {
    this.reset();
  }

  // Whether the program put anything on the screen.
  hasOutput() {
    return this.scene !== null;
  }
}
