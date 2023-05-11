import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

import DropletBlockTooltipManager from '@cdo/apps/blockTooltips/DropletBlockTooltipManager.js';

describe('DropletBlockTooltipManager', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getTooltipHTML', () => {
    it('should render localized string for "Show Code"', () => {
      // Stub the i18n calls.
      sinon.stub(commonI18n, 'showGeneratedCode').returns('i18n-show-code');

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
      expect(a.textContent).to.equal('i18n-show-code');
    });

    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      sinon.stub(commonI18n, 'examples').returns('i18n-examples');

      // Mock a DropletTooltipManager.
      let dropletConfig = {};
      let blockInfo = {
        showExamplesLink: 'http://example.com/examples',
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
      expect(a.textContent).to.equal('i18n-examples');
    });
  });
});
