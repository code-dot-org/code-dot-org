import {createContext} from 'react';

import type {
  BlockDefinition,
  Theme,
  Renderer,
} from '@/components/blockly/types';

export interface BlocklyContent {
  theme?: Theme;
  setTheme: (value: Theme) => void;
  renderer?: Renderer;
  customBlocks: BlockDefinition[];
}

const BlocklyContext = createContext<BlocklyContent>({
  setTheme: (_: Theme) => {},
  customBlocks: [],
});

export default BlocklyContext;
