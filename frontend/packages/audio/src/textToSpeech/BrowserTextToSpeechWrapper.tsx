import type {FunctionComponent, PropsWithChildren} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';

import {isTtsAvailable, onTtsAvailable, speak} from './BrowserTextToSpeech';

/**
 * A wrapper component that provides the browser text-to-speech context.
 * Attaches a listener that updates context when browser text-to-speech is ready.
 */
const BrowserTextToSpeechWrapper: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [ttsReady, setTtsReady] = useState(isTtsAvailable());

  useEffect(() => {
    onTtsAvailable(setTtsReady);
  }, []);

  return (
    <BrowserTtsContext.Provider value={{isTtsAvailable: ttsReady, ...ttsApi}}>
      {children}
    </BrowserTtsContext.Provider>
  );
};

type BrowserTtsContextType = {
  isTtsAvailable: boolean;
} & typeof ttsApi;

const ttsApi = {
  speak,
  cancel: () => speechSynthesis.cancel(),
  pause: () => speechSynthesis.pause(),
  resume: () => speechSynthesis.resume(),
};

const BrowserTtsContext = createContext<BrowserTtsContextType>({
  isTtsAvailable: isTtsAvailable(),
  ...ttsApi,
});

/** Hook to access the browser text-to-speech context. */
export function useBrowserTextToSpeech() {
  return useContext(BrowserTtsContext);
}

export default BrowserTextToSpeechWrapper;
