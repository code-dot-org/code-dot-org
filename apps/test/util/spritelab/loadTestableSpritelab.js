import 'script-loader!@code-dot-org/p5.play/examples/lib/p5';
import 'script-loader!@code-dot-org/p5.play/lib/p5.play';
import loadSpritelab from '@cdo/apps/sites/studio/pages/init/loadSpritelab';

// This loads SpriteLab, but includes p5 and p5.play so they can be included in tests.
export default function loadTestableSpritelab(options) {
  let loadedSpritelab = loadSpritelab(options);
  window.Gamelab = loadedSpritelab;
  return loadedSpritelab;
}
