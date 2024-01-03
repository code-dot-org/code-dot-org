import {expect} from '../../util/reconfiguredChai';
import sinon from 'sinon';
import commonI18n from '@cdo/locale';

import {DropletTooltipManagerStub} from './stubs';

import DropletAutocompleteParameterTooltipManager from '@cdo/apps/blockTooltips/DropletAutocompleteParameterTooltipManager.js';

describe('DropletAutocompleteParameterTooltipManager', () => {
  afterEach(() => {
    sinon.restore();
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
      sinon.stub(commonI18n, 'choosePrefix').returns('i18n-choose-prefix');

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let html = tooltip.getTooltipHTML(tooltipInfo, 0);

      // It should contain a link with the "Choose..." localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-choose-link a');
      expect(a.textContent).to.equal('i18n-choose-prefix');
    });

    it('should render localized string for "Examples"', () => {
      // Stub the i18n calls.
      sinon.stub(commonI18n, 'examples').returns('i18n-examples');

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let html = tooltip.getTooltipHTML(tooltipInfo, 0);

      // It should contain a link with the "Examples" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-example-link a');
      expect(a.textContent).to.equal('i18n-examples');
    });
  });
});
