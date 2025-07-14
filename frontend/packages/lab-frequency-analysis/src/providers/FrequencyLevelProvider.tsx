import React, {PropsWithChildren, useState} from 'react';

import FrequencyLevelContext from '../contexts/FrequencyLevelContext';

export interface FrequencyLevelProviderProps extends PropsWithChildren {
  mapLetter: (letter: string, mapTo: string) => void;
  swapMapping: (letter: string, mapTo: string) => void;
  clearMapping: (letter: string) => void;
  isMapped: (letter: string) => boolean;
}

const FrequencyLevelProvider: React.FunctionComponent<
  FrequencyLevelProviderProps
> = ({mapLetter, swapMapping, clearMapping, isMapped, children}) => {
  // Themes can be updated
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <FrequencyLevelContext.Provider
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
    </FrequencyLevelContext.Provider>
  );
};

export default FrequencyLevelProvider;
