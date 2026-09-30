import {useMemo} from 'react';

import {BlocklyLab} from '@code-dot-org/lab/components';
import {useLevelProperties} from '@code-dot-org/lab/contexts';

import {levelPool, type PoolBlock} from './blockly/pool';
import {SPRITELAB2_BLOCKS} from './blockly/setup';
import defaultSources from './defaultSources.json';
import type {Sources, SpriteLab2LevelProperties} from './types';
import SpriteLabView from './views/SpriteLabView';

/** Sprite Lab, as a host renders it inside its `<Lab>`. */
function App() {
  const levelProperties = useLevelProperties<SpriteLab2LevelProperties>();
  const sharedBlocks = levelProperties?.sharedBlocks as PoolBlock[] | undefined;
  const blocklyProps = useMemo(
    () => ({
      blocks: [...SPRITELAB2_BLOCKS, ...levelPool(sharedBlocks).definitions],
    }),
    [sharedBlocks],
  );
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
