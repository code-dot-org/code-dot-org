import {expect} from '../../util/configuredChai';
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
          playspacePhoneFrame={true}
          isResponsive={false}
          // relevant to widget mode tests
          widgetMode={true}
        />
      );
    });

    it('uses the widgetWidth and widgetHeight class', () => {
      expect(visualization.find('div.widgetWidth')).to.have.lengthOf(1);
      expect(visualization.find('div.widgetHeight')).to.have.lengthOf(1);
    });

    it('has a width equal to WIDGET_WIDTH', () => {
      expect(visualization.state().appWidth).to.equal(WIDGET_WIDTH);
    });
  });
});
