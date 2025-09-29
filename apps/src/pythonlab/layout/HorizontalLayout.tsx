import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React from 'react';

import AiChatHeaderButtons from '@cdo/apps/aichat/views/aiChatHeaderButtons/AiChatHeaderButtons';
import {queryParams} from '@cdo/apps/code-studio/utils';
import HorizontalOutput from '@cdo/apps/codebridge/Workspace/HorizontalOutput';
import {useHorizontalLayout} from '@cdo/apps/lab2/hooks/useHorizontalLayout';
import AiTutor2Chat from '@cdo/apps/lab2/views/components/AiTutor2Chat';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';

const MIN_RIGHT_PANEL_WIDTH = 300;
const MIN_LEFT_PANEL_WIDTH = 150;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = experiments.isEnabledAllowingQueryString(
  experiments.LAB2_RESOURCE_PANEL
)
  ? 330
  : 300;
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
  const {hiddenContextCallback, levelProperties} = useCodebridgeContext();

  // AI Tutor 2 is shown in the resource panel if enabled.
  const showAiTutor2 =
    !experiments.isEnabledAllowingQueryString(
      experiments.LAB2_RESOURCE_PANEL
    ) &&
    (levelProperties.aiTutorAvailable ||
      queryParams('show-ai-tutor2') === 'true');

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
    panelClassName,
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
              className={classNames(moduleStyles.flexShrink0, panelClassName)}
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
                className={panelClassName}
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
            className={panelClassName}
          />
        </div>
        {showAiTutor2 && hiddenContextCallback && (
          <div style={{width: rightmostPanelWidth}}>
            <PanelContainer
              id="aitutor2"
              headerContent="AI Tutor"
              className={moduleStyles.rightmostColumn}
              rightHeaderContent={<AiChatHeaderButtons />}
            >
              <div className={moduleStyles.inside}>
                <AiTutor2Chat hiddenContextCallback={hiddenContextCallback} />
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
