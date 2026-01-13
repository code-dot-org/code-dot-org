import type {FunctionComponent, PropsWithChildren} from 'react';
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
 * This hook returns the share dialog state.
 */
export const useExtraLinksButtonContext = () => {
  return useContext(ExtraLinksButtonContext);
};

/**
 * Holds the share state.
 */
export const ExtraLinksButtonProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
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
