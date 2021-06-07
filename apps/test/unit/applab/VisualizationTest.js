import {expect} from '../../util/deprecatedChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedVisualization} from '@cdo/apps/applab/Visualization';
import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';

describe('Visualization', () => {
  describe('in widget mode', () => {
    let visualization;

    beforeEach(() => {
      visualization = shallow(
        <UnconnectedVisualization
          visualizationHasPadding={false}
          isShareView={false}
          isPaused={false}
          isRunning={false}
          isResponsive={false}
          // relevant to widget mode tests
          widgetMode
          playspacePhoneFrame
        />
      );
    });

    it('uses the widgetWidth and widgetHeight classes', () => {
      expect(visualization.instance().getVisualizationClassNames()).to.equal(
        'widgetWidth widgetHeight'
      );
    });

    it('applies the correct width to child elements', () => {
      const vizOverlay = visualization.find('Connect(VisualizationOverlay)');
      expect(vizOverlay).to.have.lengthOf(1);
      expect(vizOverlay.prop('width')).to.equal(WIDGET_WIDTH);

      const makerOverlay = visualization.find(
        'Connect(UnconnectedMakerStatusOverlay)'
      );
      expect(makerOverlay).to.have.lengthOf(1);
      expect(makerOverlay.prop('width')).to.equal(WIDGET_WIDTH);
    });
  });
});
