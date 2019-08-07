import {expect} from '../../util/configuredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedApplabVisualizationColumn} from '@cdo/apps/applab/ApplabVisualizationColumn';
import {WIDGET_WIDTH} from '@cdo/apps/applab/constants';

describe('AppLabVisualizationColumn', () => {
  describe('in widget mode', () => {
    let visualizationColumn;
    beforeEach(() => {
      visualizationColumn = shallow(
        <UnconnectedApplabVisualizationColumn
          isReadOnlyWorkspace={false}
          visualizationHasPadding={false}
          isShareView={false}
          isResponsive={false}
          nonResponsiveWidth={0}
          isRunning={false}
          hideSource={false}
          playspacePhoneFrame={false}
          isIframeEmbed={false}
          pinWorkspaceToBottom={false}
          awaitingContainedResponse={false}
          isEditingProject={false}
          screenIds={[]}
          onScreenCreate={() => {}}
          widgetMode={true}
        />
      );
    });

    afterEach(() => {
      visualizationColumn = undefined;
    });

    it('rendered width equals widget width', () => {
      expect(visualizationColumn.state().renderedWidth).to.equal(WIDGET_WIDTH);
    });

    it('class name is widgetWidth', () => {
      expect(visualizationColumn.instance().getClassNames()).to.equal(
        'widgetWidth'
      );
    });
  });
});
