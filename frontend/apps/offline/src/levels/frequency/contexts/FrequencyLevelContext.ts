import {createContext} from 'react';

export interface FrequencyLevelContent {
  /** The currently selected letter */
  selected?: string;
  /** This will update the currently selected letter. */
  setSelected: (letter: string) => void;
  /** This function will set the given cipher mapping. */
  mapLetter: (letter: string, letter: string) => void;
  /** Swap cipher mappings. */
  swapMapping: (letter: string, letter: string) => void;
  /** Remove any mapping to the given cipher letter. */
  clearMapping: (letter: string) => void;
  /** Whether or not the given cipher letter is mapped in. */
  isMapped: (letter: string) => boolean;
}

const FrequencyLevelContext = createContext<FrequencyLevelContent>({
  setSelected: (_: string) => {},
  mapLetter: (_a: string, _b: string) => {},
  swapMapping: (_a: string, _b: string) => {},
  clearMapping: (_: string) => {},
  isMapped: (_: string) => false,
});

export default FrequencyLevelContext;
