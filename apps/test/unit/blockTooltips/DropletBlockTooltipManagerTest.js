import DropletBlockTooltipManager from '@cdo/apps/blockTooltips/DropletBlockTooltipManager.js';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

describe('DropletBlockTooltipManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTooltipHTML', () => {
    it('should render localized string for "Show Code"', () => {
      // Stub the i18n calls.
      jest
        .spyOn(commonI18n, 'showGeneratedCode')
        .mockClear()
        .mockReturnValue('i18n-show-code');

      // Mock a DropletTooltipManager.
      let dropletConfig = {};
      let blockInfo = {
        showCodeLink: 'http://example.com/code',
      };
      let tooltipManager = DropletTooltipManagerStub(dropletConfig, blockInfo);

      // Create the block tooltip manager class.
      let tooltip = new DropletBlockTooltipManager(tooltipManager);

      // Render the tooltip.
      let html = tooltip.getTooltipHTML();

      // It should contain a link with the "Show Code" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-code-link a');
      expect(a.textContent).toBe('i18n-show-code');
    });

    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      jest
        .spyOn(commonI18n, 'examples')
        .mockClear()
        .mockReturnValue('i18n-examples');

      // Mock a DropletTooltipManager for a lab that publishes docs.
      let dropletConfig = {showExamplesLink: true};
      let blockInfo = {
        showExamplesLink: true,
      };
      let tooltipManager = DropletTooltipManagerStub(dropletConfig, blockInfo);

      // Create the block tooltip manager class.
      let tooltip = new DropletBlockTooltipManager(tooltipManager);

      // Render the tooltip.
      let html = tooltip.getTooltipHTML();

      // It should contain a link with the "Examples" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-example-link a');
      expect(a.textContent).toBe('i18n-examples');
    });

    it('should omit "Examples" for a lab that publishes no docs', () => {
      // Play Lab, Artist and Maze leave showExamplesLink out of their droplet
      // config, so the /docs/ URL we would link to does not exist.
      let dropletConfig = {};
      let blockInfo = {
        showExamplesLink: true,
      };
      let tooltipManager = DropletTooltipManagerStub(dropletConfig, blockInfo);

      let tooltip = new DropletBlockTooltipManager(tooltipManager);

      let el = document.createElement('div');
      el.innerHTML = tooltip.getTooltipHTML();
      expect(el.querySelector('.tooltip-example-link')).toBeNull();
    });
  });
});
