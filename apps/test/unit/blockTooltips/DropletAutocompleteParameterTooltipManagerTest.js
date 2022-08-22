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
    it('should render localized string for "Choose..."', () => {
      // Stub the i18n calls.
      sinon.stub(commonI18n, 'choosePrefix').returns('i18n-choose-prefix');

      // Mock a DropletTooltipManager.
      // We need to describe the function as having at least one parameter.
      let dropletConfig = {
        showExamplesLink: 'http://example.com/examples'
      };
      let blockInfo = {
        parameterInfos: [
          {
            description: 'parameter description',
            assetTooltip: 'assetTooltip'
          }
        ]
      };
      let manager = DropletTooltipManagerStub(dropletConfig, blockInfo);

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let tooltipInfo = manager.getDropletTooltip('functionName');
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

      // Mock a DropletTooltipManager.
      // We need to describe the function as having at least one parameter.
      let dropletConfig = {
        showExamplesLink: 'http://example.com/examples'
      };
      let blockInfo = {
        parameterInfos: [
          {
            description: 'parameter description',
            assetTooltip: 'assetTooltip'
          }
        ]
      };
      let manager = DropletTooltipManagerStub(dropletConfig, blockInfo);

      // Create the parameter tooltip manager class.
      let tooltip = new DropletAutocompleteParameterTooltipManager(manager);

      // Render the tooltip (the first parameter).
      let tooltipInfo = manager.getDropletTooltip('functionName');
      let html = tooltip.getTooltipHTML(tooltipInfo, 0);

      // It should contain a link with the "Examples" localized text.
      let el = document.createElement('div');
      el.innerHTML = html;
      let a = el.querySelector('.tooltip-example-link a');
      expect(a.textContent).to.equal('i18n-examples');
    });
  });
});
