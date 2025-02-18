import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import DropletTooltipManager from '@cdo/apps/blockTooltips/DropletTooltipManager.js';

/**
 * Stubs out an instance of DropletTooltipManager for the given block info.
 *
 * @param {Object} config - The droplet config.
 * @param {Object} blockInfo - The block information.
 */
export function DropletTooltipManagerStub(config = {}, blockInfo = {}) {
  let tooltipManager = sinon.createStubInstance(DropletTooltipManager);

  // Establish the droplet configuration.
  tooltipManager.dropletConfig = Object.assign(
    {
      showExamplesLink: undefined,
    },
    config
  );

  // We need one to give us a code link.
  tooltipManager.getDropletTooltip.returns(
    Object.assign(
      {
        functionName: 'exampleFunction',
        isProperty: false,
        tipPrefix: undefined,
        functionShortDescription: 'short description',
        parameterInfos: [],
        signatureOverride: undefined,
        showExamplesLink: undefined,
        showCodeLink: undefined,
      },
      blockInfo
    )
  );

  return tooltipManager;
}
