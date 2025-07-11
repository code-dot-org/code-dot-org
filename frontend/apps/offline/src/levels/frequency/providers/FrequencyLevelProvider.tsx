import React, {PropsWithChildren, useState} from 'react';

import FrequencyLevelContext from '../contexts/FrequencyLevelContext';

const FrequencyLevelProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  // Themes can be updated
  const [selected, setSelected] = useState<string | undefined>(undefined);

  return (
    <FrequencyLevelContext.Provider
      value={{
        selected,
        setSelected,
      }}
    >
      {children}
    </FrequencyLevelContext.Provider>
  );
};

export default FrequencyLevelProvider;
