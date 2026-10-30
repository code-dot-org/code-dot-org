import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';
import {UnconnectedVisualization} from '@cdo/apps/applab/Visualization';

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
      expect(visualization.instance().getVisualizationClassNames()).toBe(
        'widgetWidth widgetHeight'
      );
    });

    it('applies the correct width to child elements', () => {
      const vizOverlay = visualization.find('Connect(VisualizationOverlay)');
      expect(vizOverlay).toHaveLength(1);
      expect(vizOverlay.prop('width')).toBe(WIDGET_WIDTH);

      const makerOverlay = visualization.find(
        'Connect(UnconnectedMakerStatusOverlay)'
      );
      expect(makerOverlay).toHaveLength(1);
      expect(makerOverlay.prop('width')).toBe(WIDGET_WIDTH);
    });
  });
});
