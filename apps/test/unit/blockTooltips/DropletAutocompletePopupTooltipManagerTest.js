import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

import DropletAutocompletePopupTooltipManager from '@cdo/apps/blockTooltips/DropletAutocompletePopupTooltipManager.js';

describe('DropletAutocompletePopupTooltipManager', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTooltipHTML', () => {
    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      sinon.stub(commonI18n, 'examples').returns('i18n-examples');

      // Mock a DropletTooltipManager.
      let tooltipManager = DropletTooltipManagerStub({
        showExamplesLink: 'http://example.com/examples',
      });

      // Create the popup tooltip manager class.
      let tooltip = new DropletAutocompletePopupTooltipManager(tooltipManager);

      // Render the tooltip.
      let html = tooltip.getTooltipHTML('functionName');

      // It should contain a link with the "Examples" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-example-link a');
      expect(a.textContent).to.equal('i18n-examples');
    });
  });
});
