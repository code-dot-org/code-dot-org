import React, {PropsWithChildren, useState} from 'react';

import {BlocklyContext} from '@blockly-workspace/contexts';
import type {Plugin} from '@blockly-workspace/plugins';
import type {
  BlockDefinition,
  Theme,
  Renderer,
  Environment,
} from '@blockly-workspace/types';

export interface BlocklyProviderProps extends PropsWithChildren {
  customBlocks?: BlockDefinition[];
  environment?: Environment & object;
  theme?: Theme;
  plugins?: Plugin[];
  renderer?: Renderer;
}

const BlocklyProvider: React.FunctionComponent<BlocklyProviderProps> = ({
  customBlocks,
  environment,
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
        environment,
        customBlocks: customBlocks || [],
      }}
    >
      {children}
    </BlocklyContext.Provider>
  );
};

export default BlocklyProvider;
