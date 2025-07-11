import {createContext} from 'react';

export interface FrequencyLevelContent {
  /** The currently selected letter */
  selected?: string;
  /** This will update the currently selected letter. */
  setSelected: (letter: string) => void;
}

const FrequencyLevelContext = createContext<FrequencyLevelContent>({
  setSelected: (_: string) => {},
});

export default FrequencyLevelContext;
