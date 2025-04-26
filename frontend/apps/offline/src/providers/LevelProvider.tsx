import React, {PropsWithChildren, useState} from 'react';

import LevelContext from '@/contexts/LevelContext';

/**
 * This keesp track of the current level data.
 */
const LevelProvider: React.FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  // Hints can be revealed by incrementing the hint shown count
  const [hintsShown, setHintsShown] = useState<number>(0);

  return (
    <LevelContext.Provider
      value={{
        hintsShown,
        setHintsShown,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export default LevelProvider;
