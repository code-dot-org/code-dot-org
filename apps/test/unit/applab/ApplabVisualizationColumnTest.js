import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

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
      expect(iframeEmbed).toHaveLength(1);
      expect(iframeEmbed.prop('appWidth')).toBe(WIDGET_WIDTH);
    });

    it('className includes widgetWidth', () => {
      expect(visualizationColumn.instance().getClassNames()).toContain('widgetWidth');
    });

    it('does not render a ResetButton', () => {
      expect(visualizationColumn.find('ResetButton')).to.not.have.length;
    });

    it('displays a centered finish button', () => {
      expect(
        visualizationColumn.instance().getCompletionButtonSyle()
      ).toMatchObject({display: 'block'});
    });
  });
});
