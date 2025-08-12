import {createContext} from 'react';

import {Unit} from '@code-dot-org/models/units';

export interface UnitContent {
  unit?: Unit;
}

const UnitContext = createContext<UnitContent>({});

export default UnitContext;
