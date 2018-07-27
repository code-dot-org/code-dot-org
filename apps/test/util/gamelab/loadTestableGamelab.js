import "script-loader!@code-dot-org/p5.play/examples/lib/p5";
import "script-loader!@code-dot-org/p5.play/lib/p5.play";
import GameLabJr from '@cdo/interpreted/GameLabJr.interpreted.js';
import ValidationSetup from '@cdo/interpreted/ValidationSetup.interpreted.js';
import loadGamelab from '@cdo/apps/sites/studio/pages/init/loadGamelab';

// This loads Gamelab, but includes p5 and p5.play so they can be included in tests.
export default function loadTestableGamelab(options) {
  let loadedGamelab = loadGamelab(options);
  window.Gamelab = loadedGamelab;
  loadedGamelab.libraries = {GameLabJr, ValidationSetup};
  return loadedGamelab;
}
