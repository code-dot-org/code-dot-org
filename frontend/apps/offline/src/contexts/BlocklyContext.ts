import {createContext} from 'react';

import type {BlockDefinition} from '@/components/blockly/types';

export interface BlocklyContent {
  theme?: string;
  setTheme: (value: string) => void;
  renderer?: string;
  customBlocks: BlockDefinition[];
}

const BlocklyContext = createContext<BlocklyContent>({
  setTheme: (_: string) => {},
  customBlocks: [],
});

export default BlocklyContext;
