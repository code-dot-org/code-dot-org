'use client';

import React, {PropsWithChildren} from 'react';

import type {Unit} from '@code-dot-org/models/units';

import UnitContext from '@/contexts/UnitContext';

export interface UnitProviderProps extends PropsWithChildren {
  unit?: Unit;
}

/**
 * This keeps track of the current unit data.
 */
const UnitProvider: React.FunctionComponent<UnitProviderProps> = ({
  unit,
  children,
}) => {
  return <UnitContext.Provider value={{unit}}>{children}</UnitContext.Provider>;
};

export default UnitProvider;
