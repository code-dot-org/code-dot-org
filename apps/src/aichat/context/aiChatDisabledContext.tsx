import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';

export interface AiChatDisabledContextValue {
  chatDisabled: boolean;
  chatDisabledMessage?: string;
  setChatDisabled: (chatDisabled: boolean) => void;
  setChatDisabledMessage: (chatDisabledMessage?: string) => void;
  setChatDisabledState: (state: {
    chatDisabled: boolean;
    chatDisabledMessage?: string;
  }) => void;
}

const throwIfNoProvider = (fnName: string) => {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error(
      `useAiChatDisabled ${fnName} called without an AiChatDisabledProvider in the tree.`
    );
  }
};

// reading state values when not wrapped in a provider is okay, default is not disabled
// but setting state will throw an error in non-production environments to ensure provider has been added
const defaultContextValue: AiChatDisabledContextValue = {
  chatDisabled: false,
  chatDisabledMessage: undefined,
  setChatDisabled: () => throwIfNoProvider('setChatDisabled'),
  setChatDisabledMessage: () => throwIfNoProvider('setChatDisabledMessage'),
  setChatDisabledState: () => throwIfNoProvider('setChatDisabledState'),
};

export const AiChatDisabledContext =
  createContext<AiChatDisabledContextValue>(defaultContextValue);

export type AiChatDisabledProviderProps = PropsWithChildren<{
  chatDisabled?: boolean;
  chatDisabledMessage?: string;
}>;

export const AiChatDisabledProvider: FC<AiChatDisabledProviderProps> = ({
  chatDisabled = false,
  chatDisabledMessage,
  children,
}) => {
  // TODO: remove disabling chat via query param
  const chatDisabledParam = !!queryParams('disable-ai-chat');
  const chatDisabledMessageParam = queryParams('disable-ai-chat-message') as
    | string
    | undefined;

  const [state, setState] = useState<{
    chatDisabled: boolean;
    chatDisabledMessage?: string;
  }>(() => ({
    chatDisabled: chatDisabled || chatDisabledParam,
    chatDisabledMessage: chatDisabledMessage ?? chatDisabledMessageParam,
  }));

  const value = useMemo<AiChatDisabledContextValue>(
    () => ({
      chatDisabled: state.chatDisabled,
      chatDisabledMessage: state.chatDisabledMessage,
      setChatDisabled: (chatDisabled: boolean) =>
        setState(prevState => ({...prevState, chatDisabled})),
      setChatDisabledMessage: (chatDisabledMessage?: string) =>
        setState(prevState => ({...prevState, chatDisabledMessage})),
      setChatDisabledState: (newState: {
        chatDisabled: boolean;
        chatDisabledMessage?: string;
      }) => setState(newState),
    }),
    [state]
  );

  return (
    <AiChatDisabledContext.Provider value={value}>
      {children}
    </AiChatDisabledContext.Provider>
  );
};

export const useAiChatDisabled = () => useContext(AiChatDisabledContext);
