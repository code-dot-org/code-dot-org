import React, {createContext, useContext, ReactNode} from 'react';

import type {BrandCode} from './brand';

const BrandContext = createContext<BrandCode | undefined>(undefined);

export function useBrand(): BrandCode {
  const brand = useContext(BrandContext);
  if (brand === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return brand;
}

export const BrandProvider = ({
  brand,
  children,
}: {
  brand: BrandCode;
  children: ReactNode;
}) => <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
