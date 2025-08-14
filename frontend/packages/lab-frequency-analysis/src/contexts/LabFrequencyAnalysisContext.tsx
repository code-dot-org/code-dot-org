import React, {PropsWithChildren, useState, createContext} from 'react';

export interface LabFrequencyAnalysisContent {
  /** The currently selected letter */
  selected?: string;
  /** This will update the currently selected letter. */
  setSelected: (letter?: string) => void;
  /** This function will set the given cipher mapping. */
  mapLetter: (letter: string, mapTo: string) => void;
  /** Swap cipher mappings. */
  swapMapping: (letter: string, mapTo: string) => void;
  /** Remove any mapping to the given cipher letter. */
  clearMapping: (letter: string) => void;
  /** Whether or not the given cipher letter is mapped in. */
  isMapped: (letter: string) => boolean;
}

const LabFrequencyAnalysisContext = createContext<LabFrequencyAnalysisContent>({
  setSelected: (_?: string) => {},
  mapLetter: (_a: string, _b: string) => {},
  swapMapping: (_a: string, _b: string) => {},
  clearMapping: (_: string) => {},
  isMapped: (_: string) => false,
});

export interface LabFrequencyAnalysisProviderProps extends PropsWithChildren {
  mapLetter: (letter: string, mapTo: string) => void;
  swapMapping: (letter: string, mapTo: string) => void;
  clearMapping: (letter: string) => void;
  isMapped: (letter: string) => boolean;
}

export const LabFrequencyAnalysisProvider: React.FunctionComponent<
  LabFrequencyAnalysisProviderProps
> = ({mapLetter, swapMapping, clearMapping, isMapped, children}) => {
  // Themes can be updated
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <LabFrequencyAnalysisContext.Provider
      value={{
        selected,
        setSelected,
        mapLetter,
        swapMapping,
        clearMapping,
        isMapped,
      }}
    >
      {children}
    </LabFrequencyAnalysisContext.Provider>
  );
};

export default LabFrequencyAnalysisContext;
