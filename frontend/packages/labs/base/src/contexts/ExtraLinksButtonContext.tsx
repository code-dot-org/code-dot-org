import type {PropsWithChildren} from 'react';
import {useState, createContext, useContext} from 'react';

/**
 * Describes the state of the share dialog.
 */
export interface ExtraLinksButtonContent {
  setShowExtraLinksButton: (show: boolean) => void;
  showExtraLinksButton: boolean;
}

/**
 * The current lab application metadata.
 */
const ExtraLinksButtonContext = createContext<ExtraLinksButtonContent>({
  setShowExtraLinksButton: (_: boolean) => {},
  showExtraLinksButton: false,
});

/**
 * This hook returns the extra links state.
 */
export const useExtraLinksButton = () => {
  return useContext(ExtraLinksButtonContext);
};

/**
 * Holds the share state.
 */
export const ExtraLinksButtonProvider = ({children}: PropsWithChildren) => {
  const [showExtraLinksButton, setShowExtraLinksButton] = useState(true);

  return (
    <ExtraLinksButtonContext.Provider
      value={{
        showExtraLinksButton,
        setShowExtraLinksButton,
      }}
    >
      {children}
    </ExtraLinksButtonContext.Provider>
  );
};

export default ExtraLinksButtonContext;
