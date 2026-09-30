import {BlocklyLab} from '@code-dot-org/lab/components';

import {SPRITELAB2_BLOCKS} from './blockly/setup';
import defaultSources from './defaultSources.json';
import type {Sources, SpriteLab2LevelProperties} from './types';
import SpriteLabView from './views/SpriteLabView';

const blocklyProps = {blocks: SPRITELAB2_BLOCKS};

/** Sprite Lab, as a host renders it inside its `<Lab>`. */
function App() {
  return (
    <BlocklyLab<SpriteLab2LevelProperties>
      defaultSources={defaultSources as Sources}
      blocklyProps={blocklyProps}
    >
      <SpriteLabView />
    </BlocklyLab>
  );
}

export default App;
