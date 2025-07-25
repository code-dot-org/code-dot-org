import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';
import {useHorizontalLayout} from '@cdo/apps/lab2/hooks/useHorizontalLayout';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 300;
const MIN_LEFT_PANEL_WIDTH = 150;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_OUTPUT_HEIGHT = 300;
const INITIAL_OUTPUT_HEIGHT_WIDGET = 800;
const PROJECT_FOOTER_HEIGHT = 56;

const HorizontalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
  isWidgetView,
}) => {
  const widgetViewShowCode = useAppSelector(
    state => state.codebridgeWorkspace.widgetViewShowCode
  );
  const {aiTutor2Context, levelProperties} = useCodebridgeContext();

  const showAiTutor2 =
    levelProperties.aiTutor2Available ||
    queryParams('show-ai-tutor2') === 'true';

  const {
    leftPanelWidth,
    rightPanelWidth,
    rightTopPanelHeight,
    rightBottomPanelHeight,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightBottomPanelSeparatorProps,
    rightBottomPanelDragging,
    setRightBottomPanelSize,
    rightmostPanelWidth,
  } = useHorizontalLayout({
    leftPanel: {
      initialWidth: isProjectLevel ? 0 : INITIAL_INFO_PANEL_WIDTH,
      minWidth: isProjectLevel ? 0 : MIN_LEFT_PANEL_WIDTH,
      name: 'instructions',
    },
    rightTopPanel: {
      minHeight: isWidgetView && !widgetViewShowCode ? 0 : MIN_EDITOR_HEIGHT,
      name: 'editor',
    },
    rightBottomPanel: {
      initialHeight:
        isWidgetView && !widgetViewShowCode
          ? INITIAL_OUTPUT_HEIGHT_WIDGET
          : INITIAL_OUTPUT_HEIGHT,
      minHeight: MIN_OUTPUT_HEIGHT,
      name: 'output',
    },
    minRightPanelWidth: MIN_RIGHT_PANEL_WIDTH,
    appName: 'pythonlab',
    heightOffset: isProjectLevel ? PROJECT_FOOTER_HEIGHT : 0,
    showingRightmostPanel: showAiTutor2,
  });

  return (
    <div
      className={
        isProjectLevel
          ? moduleStyles.containerWithFooter
          : moduleStyles.defaultContainer
      }
    >
      <div className={moduleStyles.layoutContainer}>
        {!isProjectLevel && (
          <>
            <InfoPanel
              style={{width: leftPanelWidth}}
              className={moduleStyles.flexShrink0}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={leftPanelSeparatorProps}
              isDragging={leftPanelDragging}
            />
          </>
        )}
        <div
          className={moduleStyles.flexColumn}
          style={{width: rightPanelWidth}}
        >
          {(!isWidgetView || widgetViewShowCode) && (
            <>
              <Workspace
                style={{height: rightTopPanelHeight}}
                isWidgetView={isWidgetView}
              />
              <ResizeBar
                isVertical={false}
                separatorProps={rightBottomPanelSeparatorProps}
                isDragging={rightBottomPanelDragging}
              />
            </>
          )}
          <HorizontalOutput
            height={rightBottomPanelHeight || INITIAL_OUTPUT_HEIGHT}
            width={rightPanelWidth}
            setOutputHeight={setRightBottomPanelSize}
          />
        </div>
        {showAiTutor2 && aiTutor2Context && (
          <div style={{width: rightmostPanelWidth}}>
            <PanelContainer
              id="aitutor2"
              headerContent="AI Tutor"
              className={moduleStyles.rightmostColumn}
            >
              <div className={moduleStyles.inside}>
                <AiTutor2Chat hiddenContext={aiTutor2Context} />
              </div>
            </PanelContainer>
          </div>
        )}
      </div>
      {isProjectLevel && <div className={moduleStyles.footerArea} />}
    </div>
  );
};

export default HorizontalLayout;
