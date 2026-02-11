import type {PropsWithChildren, MutableRefObject} from 'react';
import {useCallback, createContext, useRef, useEffect, useContext} from 'react';

import Driver from '../Driver';
import type {Plugin} from '../plugins';
import type {BlockDefinitions, Theme, Renderer, Environment} from '../types';

import DefaultTheme from '../themes/default';
import ThrasosRenderer from '../renderers/thrasos';

export interface BlocklyContent<T extends Environment = Environment> {
  driver?: MutableRefObject<Driver<T>>;
  environment?: T;
  setTheme: (value: Theme) => void;
}

const BlocklyContext = createContext<BlocklyContent>({
  setTheme: (_: Theme) => {},
} as unknown as BlocklyContent);

/**
 * This hook returns the blockly state.
 */
export const useBlocklyContext = <T extends Environment = Environment>() => {
  return useContext(BlocklyContext) as unknown as T;
};

export interface BlocklyProviderProps<T extends Environment = Environment>
  extends PropsWithChildren {
  blocks?: BlockDefinitions;
  environment?: T;
  theme?: Theme;
  plugins?: Plugin[];
  renderer?: Renderer;
}

export const BlocklyProvider = <T extends Environment = Environment>({
  blocks,
  environment,
  theme,
  plugins,
  renderer,
  children,
}: BlocklyProviderProps<T>) => {
  // Create a Driver to handle all of the state
  const driver = useRef<Driver<T>>(
    new Driver<T>(
      environment || ({} as unknown as T),
      renderer || ThrasosRenderer,
      theme || DefaultTheme,
      plugins || [],
    ),
  );

  // Themes can be updated
  const setTheme = useCallback((newTheme: Theme | undefined) => {
    driver.current.theme = newTheme;
  }, []);

  useEffect(() => {
    driver.current.blocks = blocks || [];
  }, [blocks]);

  return (
    <BlocklyContext.Provider
      value={{
        driver,
        setTheme,
        environment,
      }}
    >
      {children}
    </BlocklyContext.Provider>
  );
};

export default BlocklyContext;
