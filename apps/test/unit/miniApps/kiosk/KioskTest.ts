import {
  KioskElementType,
  KioskSignalType,
} from '@cdo/apps/miniApps/kiosk/constants';
import Kiosk from '@cdo/apps/miniApps/kiosk/Kiosk';
import {KioskScene} from '@cdo/apps/miniApps/kiosk/types';

const SCENE: KioskScene = {
  elements: [
    {type: KioskElementType.LABEL, id: 'greeting', text: 'Hello', x: 5, y: 10},
  ],
};

const LATER_SCENE: KioskScene = {
  elements: [
    {
      type: KioskElementType.LABEL,
      id: 'greeting',
      text: 'You pressed it!',
      x: 5,
      y: 10,
    },
  ],
};

describe('Kiosk', () => {
  let onSceneChange: jest.Mock;
  let kiosk: Kiosk;

  beforeEach(() => {
    onSceneChange = jest.fn();
    kiosk = new Kiosk(onSceneChange);
  });

  it('starts with nothing on screen', () => {
    expect(kiosk.hasOutput()).toBe(false);
    expect(onSceneChange).not.toHaveBeenCalled();
  });

  it('hands on the scene it is given', () => {
    kiosk.handleSignal({value: KioskSignalType.SCENE, detail: SCENE});

    expect(onSceneChange).toHaveBeenCalledWith(SCENE);
    expect(kiosk.hasOutput()).toBe(true);
  });

  it('replaces the scene rather than adding to it', () => {
    kiosk.handleSignal({value: KioskSignalType.SCENE, detail: SCENE});
    kiosk.handleSignal({value: KioskSignalType.SCENE, detail: LATER_SCENE});

    expect(onSceneChange).toHaveBeenCalledTimes(2);
    expect(onSceneChange).toHaveBeenLastCalledWith(LATER_SCENE);
  });

  it('ignores a signal it does not know', () => {
    kiosk.handleSignal({value: 'SOMETHING_ELSE', detail: SCENE});

    expect(onSceneChange).not.toHaveBeenCalled();
    expect(kiosk.hasOutput()).toBe(false);
  });

  it('clears the screen on reset', () => {
    kiosk.handleSignal({value: KioskSignalType.SCENE, detail: SCENE});
    kiosk.reset();

    expect(onSceneChange).toHaveBeenLastCalledWith(null);
    expect(kiosk.hasOutput()).toBe(false);
  });

  it('clears the screen on stop', () => {
    kiosk.handleSignal({value: KioskSignalType.SCENE, detail: SCENE});
    kiosk.onStop();

    expect(onSceneChange).toHaveBeenLastCalledWith(null);
    expect(kiosk.hasOutput()).toBe(false);
  });
});
