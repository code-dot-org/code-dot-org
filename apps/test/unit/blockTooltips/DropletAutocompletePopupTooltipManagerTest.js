import DropletAutocompletePopupTooltipManager from '@cdo/apps/blockTooltips/DropletAutocompletePopupTooltipManager.js';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

describe('DropletAutocompletePopupTooltipManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTooltipHTML', () => {
    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      jest
        .spyOn(commonI18n, 'examples')
        .mockClear()
        .mockReturnValue('i18n-examples');

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
      expect(a.textContent).toBe('i18n-examples');
    });
  });
});
