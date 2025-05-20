import React, {PropsWithChildren, useState} from 'react';

import type {Plugin} from '@/components/blockly/plugins';
import type {
  BlockDefinition,
  Theme,
  Renderer,
} from '@/components/blockly/types';
import BlocklyContext from '@/contexts/BlocklyContext';

export interface BlocklyProviderProps extends PropsWithChildren {
  customBlocks?: BlockDefinition[];
  theme?: Theme;
  plugins?: Plugin[];
  renderer?: Renderer;
}

const BlocklyProvider: React.FunctionComponent<BlocklyProviderProps> = ({
  customBlocks,
  theme,
  plugins,
  renderer,
  children,
}) => {
  // Themes can be updated
  const [currentTheme, setTheme] = useState<Theme | undefined>(theme);

  return (
    <BlocklyContext.Provider
      value={{
        theme: currentTheme,
        setTheme,
        plugins,
        renderer,
        customBlocks: customBlocks || [],
      }}
    >
      {children}
    </BlocklyContext.Provider>
  );
};

export default BlocklyProvider;
