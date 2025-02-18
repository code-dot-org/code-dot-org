/** @file Test SetupGuide component */
import {render, screen} from '@testing-library/react';
import React from 'react';

import applabI18n from '@cdo/applab/locale';
import SetupGuide from '@cdo/apps/maker/ui/SetupGuide';

describe('MakerSetupGuide', () => {
  describe('General description displayed correctly', () => {
    it('uses localized general description', () => {
      // Stub i18n functions.
      const i18n = {
        makerSetupGeneralTitle: 'i18n-general-title',
        makerSetupGeneralDescription: 'i18n-general-description',
      };
      for (const key in i18n) {
        jest.spyOn(applabI18n, key).mockClear().mockReturnValue(i18n[key]);
      }

      render(<SetupGuide />);
      expect(
        screen.getByRole('heading', {
          name: 'i18n-general-title',
        })
      ).toBeDefined();
      expect(screen.getByText('i18n-general-description')).toBeDefined();
      jest.restoreAllMocks();
    });
  });
});
