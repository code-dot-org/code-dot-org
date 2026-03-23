import {render, screen} from '@testing-library/react';
import React from 'react';

import {BrandProvider, useBrand} from '@cdo/apps/util/BrandContext';

const BrandDisplay = () => {
  const brand = useBrand();
  return <span role="status">{brand}</span>;
};

describe('BrandContext', () => {
  describe('useBrand', () => {
    it('returns the brand value from BrandProvider', () => {
      render(
        <BrandProvider brand="codeai">
          <BrandDisplay />
        </BrandProvider>
      );

      expect(screen.getByRole('status').textContent).toBe('codeai');
    });

    it('returns default brand from BrandProvider', () => {
      render(
        <BrandProvider brand="code">
          <BrandDisplay />
        </BrandProvider>
      );

      expect(screen.getByRole('status').textContent).toBe('code');
    });

    it('throws when used outside BrandProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => render(<BrandDisplay />)).toThrow(
        'useBrand must be used within a BrandProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});
