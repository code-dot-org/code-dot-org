import {createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';

import {DEFAULT_CODEBRIDGE_CONFIG} from '../config';
import type {CodebridgeConfig} from '../config';

/**
 * Carries the static {@link CodebridgeConfig} to the file browser and (later) the
 * editor. Provided by {@link CodebridgeLab}. Defaults to the permissive config so
 * components render outside a provider (e.g. isolated unit tests).
 */
const CodebridgeConfigContext = createContext<CodebridgeConfig>(
  DEFAULT_CODEBRIDGE_CONFIG,
);

/** The current Codebridge config. Returns permissive defaults with no provider. */
export const useCodebridgeConfig = () => useContext(CodebridgeConfigContext);

export const CodebridgeConfigProvider = ({
  config,
  children,
}: PropsWithChildren<{config: CodebridgeConfig}>) => (
  <CodebridgeConfigContext.Provider value={config}>
    {children}
  </CodebridgeConfigContext.Provider>
);
