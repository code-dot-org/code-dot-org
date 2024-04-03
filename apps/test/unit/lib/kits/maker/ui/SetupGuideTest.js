/** @file Test SetupGuide component */
import React from 'react';
import {expect} from '../../../../../util/deprecatedChai';
import {render, screen} from '@testing-library/react';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';
import applabI18n from '@cdo/applab/locale';

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
      ).to.exist;
      expect(screen.getByText('i18n-general-description')).to.exist;
      jest.restoreAllMocks();
    });
  });
});
