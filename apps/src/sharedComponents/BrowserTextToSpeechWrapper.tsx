import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  isTtsAvailable,
  onTtsAvailable,
  speak,
} from '../util/BrowserTextToSpeech';

/**
 * A wrapper component that provides the browser text-to-speech context.
 * Attaches a listener that updates context when browser text-to-speech is ready.
 */
const BrowserTextToSpeechWrapper: React.FC<{children: ReactNode}> = ({
  children,
}) => {
  const [ttsReady, setTtsReady] = useState(isTtsAvailable());

  useEffect(() => {
    onTtsAvailable(setTtsReady);
  }, []);

  return (
    <BrowserTtsContext.Provider value={{isTtsAvailable: ttsReady, speak}}>
      {children}
    </BrowserTtsContext.Provider>
  );
};

interface BrowserTtsContextType {
  isTtsAvailable: boolean;
  speak: (text: string) => void;
}

const BrowserTtsContext = createContext<BrowserTtsContextType>({
  isTtsAvailable: isTtsAvailable(),
  speak,
});

/** Hook to access the browser text-to-speech context. */
export function useBrowserTextToSpeech() {
  return useContext(BrowserTtsContext);
}

export default BrowserTextToSpeechWrapper;
