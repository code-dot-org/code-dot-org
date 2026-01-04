import React, {PropsWithChildren, useState, createContext} from 'react';

import type {Plugin} from '@blockly-workspace/plugins';
import type {
  BlockDefinition,
  Theme,
  Renderer,
  Environment,
} from '@blockly-workspace/types';

export interface BlocklyContent {
  environment?: Environment & object;
  theme?: Theme;
  setTheme: (value: Theme) => void;
  renderer?: Renderer;
  plugins?: Plugin[];
  blocks: BlockDefinition[];
}

const BlocklyContext = createContext<BlocklyContent>({
  setTheme: (_: Theme) => {},
  blocks: [],
});

export interface BlocklyProviderProps extends PropsWithChildren {
  blocks?: BlockDefinition[];
  environment?: Environment & object;
  theme?: Theme;
  plugins?: Plugin[];
  renderer?: Renderer;
}

export const BlocklyProvider: React.FunctionComponent<BlocklyProviderProps> = ({
  blocks,
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
        blocks: blocks || [],
      }}
    >
      {children}
    </BlocklyContext.Provider>
  );
};

export default BlocklyContext;
