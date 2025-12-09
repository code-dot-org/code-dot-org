import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useCallback,
  useMemo,
  useState,
} from 'react';

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
  const [state, setState] = useState<{
    chatDisabled: boolean;
    chatDisabledMessage?: string;
  }>(() => ({
    chatDisabled,
    chatDisabledMessage,
  }));

  const setChatDisabled = useCallback((chatDisabled: boolean) => {
    setState(prevState =>
      prevState.chatDisabled === chatDisabled
        ? prevState
        : {...prevState, chatDisabled}
    );
  }, []);

  const setChatDisabledMessage = useCallback((chatDisabledMessage?: string) => {
    setState(prevState =>
      prevState.chatDisabledMessage === chatDisabledMessage
        ? prevState
        : {...prevState, chatDisabledMessage}
    );
  }, []);

  const setChatDisabledState = useCallback(
    (newState: {chatDisabled: boolean; chatDisabledMessage?: string}) => {
      setState(prevState =>
        prevState.chatDisabled === newState.chatDisabled &&
        prevState.chatDisabledMessage === newState.chatDisabledMessage
          ? prevState
          : newState
      );
    },
    []
  );

  const value = useMemo<AiChatDisabledContextValue>(
    () => ({
      chatDisabled: state.chatDisabled,
      chatDisabledMessage: state.chatDisabledMessage,
      setChatDisabled,
      setChatDisabledMessage,
      setChatDisabledState,
    }),
    [state, setChatDisabled, setChatDisabledMessage, setChatDisabledState]
  );

  return (
    <AiChatDisabledContext.Provider value={value}>
      {children}
    </AiChatDisabledContext.Provider>
  );
};

export const useAiChatDisabled = () => useContext(AiChatDisabledContext);
