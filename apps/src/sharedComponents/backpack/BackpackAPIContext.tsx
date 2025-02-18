import React from 'react';

import BackpackClientApi from './BackpackClientApi';

export type BackpackContextType = BackpackClientApi;

export const BackpackAPIContext =
  React.createContext<BackpackContextType | null>(null);
