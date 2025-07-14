import {createContext} from 'react';

import {UnitData} from '@/app/models/unit';

export interface UnitContent {
  unit?: UnitData;
}

const UnitContext = createContext<UnitContent>({});

export default UnitContext;
