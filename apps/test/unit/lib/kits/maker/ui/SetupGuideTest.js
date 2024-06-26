/** @file Test SetupGuide component */
import {render, screen} from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';

import applabI18n from '@cdo/applab/locale';
import SetupGuide from '@cdo/apps/lib/kits/maker/ui/SetupGuide';

import {expect} from '../../../../../util/deprecatedChai';

describe('MakerSetupGuide', () => {
  describe('General description displayed correctly', () => {
    it('uses localized general description', () => {
      // Stub i18n functions.
      const i18n = {
        makerSetupGeneralTitle: 'i18n-general-title',
        makerSetupGeneralDescription: 'i18n-general-description',
      };
      for (const key in i18n) {
        sinon.stub(applabI18n, key).returns(i18n[key]);
      }

      render(<SetupGuide />);
      expect(
        screen.getByRole('heading', {
          name: 'i18n-general-title',
        })
      ).to.exist;
      expect(screen.getByText('i18n-general-description')).to.exist;
      sinon.restore();
    });
  });
});
