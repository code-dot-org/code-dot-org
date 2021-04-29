import {expect} from '../../util/deprecatedChai';
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
          pinWorkspaceToBottom={false}
          awaitingContainedResponse={false}
          isEditingProject={false}
          screenIds={[]}
          onScreenCreate={() => {}}
          isPaused={false}
          // relevant to widget mode tests
          widgetMode
          isIframeEmbed
          playspacePhoneFrame
        />
      );
    });

    it('renders IFrameEmbedOverlay with the correct appWidth', () => {
      const iframeEmbed = visualizationColumn.find('IFrameEmbedOverlay');
      expect(iframeEmbed).to.have.lengthOf(1);
      expect(iframeEmbed.prop('appWidth')).to.equal(WIDGET_WIDTH);
    });

    it('className includes widgetWidth', () => {
      expect(visualizationColumn.instance().getClassNames()).to.include(
        'widgetWidth'
      );
    });

    it('does not render a ResetButton', () => {
      expect(visualizationColumn.find('ResetButton')).to.not.have.length;
    });

    it('displays a centered finish button', () => {
      expect(
        visualizationColumn.instance().getCompletionButtonSyle()
      ).to.include({display: 'block'});
    });
  });
});
