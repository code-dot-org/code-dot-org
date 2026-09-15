import CodebridgeRegistry from '@codebridge/CodebridgeRegistry';

import {KioskSignalType} from '@cdo/apps/miniApps/kiosk/constants';
import {KioskScene} from '@cdo/apps/miniApps/kiosk/types';

// Turns the screen a student's program published into a scene the kiosk mini
// app can draw. The program sends JSON rather than an object because a Python
// proxy cannot be posted out of the worker.
export function handleKioskScene(sceneJson: string) {
  const kiosk = CodebridgeRegistry.getInstance().getKiosk();
  if (!kiosk) {
    return;
  }

  let scene: KioskScene;
  try {
    scene = JSON.parse(sceneJson);
  } catch {
    return;
  }

  kiosk.handleSignal({value: KioskSignalType.SCENE, detail: scene});
}
