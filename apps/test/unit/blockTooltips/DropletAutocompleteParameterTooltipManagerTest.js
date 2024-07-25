import DropletAutocompleteParameterTooltipManager from '@cdo/apps/blockTooltips/DropletAutocompleteParameterTooltipManager.js';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

describe('DropletAutocompleteParameterTooltipManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTooltipHTML', () => {
    var manager = null;
    var tooltipInfo = null;

    beforeEach(() => {
      // Build a basic droplet config.
      let dropletConfig = {
        showExamplesLink: 'http://example.com/examples',
      };

      // Create the bare essentials for a block description.
      let blockInfo = {
        parameterInfos: [
          {
            description: 'parameter description',
            assetTooltip: 'assetTooltip',
          },
        ],
      };

      // Mock a DropletTooltipManager.
      // We need to describe the function as having at least one parameter.
      manager = DropletTooltipManagerStub(dropletConfig, blockInfo);
      tooltipInfo = manager.getDropletTooltip('functionName');
    });

    it('should render localized string for "Choose..."', () => {
      // Stub the i18n calls.
      jest
        .spyOn(commonI18n, 'choosePrefix')
        .mockClear()
        .mockReturnValue('i18n-choose-prefix');

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let html = tooltip.getTooltipHTML(tooltipInfo, 0);

      // It should contain a link with the "Choose..." localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-choose-link a');
      expect(a.textContent).toBe('i18n-choose-prefix');
    });

    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      jest
        .spyOn(commonI18n, 'examples')
        .mockClear()
        .mockReturnValue('i18n-examples');

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let html = tooltip.getTooltipHTML(tooltipInfo, 0);

      // It should contain a link with the "Examples" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-example-link a');
      expect(a.textContent).toBe('i18n-examples');
    });
  });
});
