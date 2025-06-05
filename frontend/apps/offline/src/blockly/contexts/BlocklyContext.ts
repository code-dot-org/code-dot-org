import {createContext} from 'react';

import type {Plugin} from '@/blockly/plugins';
import type {
  BlockDefinition,
  Theme,
  Renderer,
  Environment,
} from '@/blockly/types';

export interface BlocklyContent {
  environment?: Environment & object;
  theme?: Theme;
  setTheme: (value: Theme) => void;
  renderer?: Renderer;
  plugins?: Plugin[];
  customBlocks: BlockDefinition[];
}

const BlocklyContext = createContext<BlocklyContent>({
  setTheme: (_: Theme) => {},
  customBlocks: [],
});

export default BlocklyContext;
