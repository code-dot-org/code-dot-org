import React, {PropsWithChildren, useState} from 'react';

import type {BlockDefinition} from '@/components/blockly/types';
import BlocklyContext from '@/contexts/BlocklyContext';

export interface BlocklyProviderProps {
  customBlocks?: BlockDefinition[];
  theme?: string;
  renderer?: string;
}

const BlocklyProvider: React.FunctionComponent<PropsWithChildren> = ({
  customBlocks,
  theme,
  renderer,
  children,
}) => {
  // Themes can be updated
  const [currentTheme, setTheme] = useState<string | undefined>(theme);

  return (
    <BlocklyContext.Provider
      value={{
        theme: currentTheme,
        setTheme,
        renderer,
        customBlocks,
      }}
    >
      {children}
    </BlocklyContext.Provider>
  );
};

export default BlocklyProvider;
