import {useCodebridgeContext} from '@codebridge/codebridgeContext';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

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
const MIN_LEFT_PANEL_WIDTH_COLLAPSED = 55;
const MIN_OUTPUT_HEIGHT = 120;
const MIN_EDITOR_HEIGHT = 200;
const INITIAL_INFO_PANEL_WIDTH = experiments.isEnabledAllowingQueryString(
  experiments.LAB2_RESOURCE_PANEL
)
  ? 330
  : 300;
const INITIAL_INFO_PANEL_WIDTH_COLLAPSED = 55;
const INITIAL_OUTPUT_HEIGHT = 300;
const INITIAL_OUTPUT_HEIGHT_WIDGET = 800;

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

  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  console.log('isStandaloneCollapsed', isStandaloneCollapsed);
  const infoPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
    : INITIAL_INFO_PANEL_WIDTH;

  const infoPanelMinWidth = isStandaloneCollapsed
    ? MIN_LEFT_PANEL_WIDTH_COLLAPSED
    : MIN_LEFT_PANEL_WIDTH;

  const {
    leftPanelWidth,
    rightPanelWidth,
    rightTopPanelHeight,
    rightBottomPanelHeight,
    leftPanelSeparatorProps,
    leftPanelDragging,
    rightBottomPanelSeparatorProps,
    rightBottomPanelDragging,
    setLeftPanelSize,
    setRightBottomPanelSize,
    rightmostPanelWidth,
    panelClassName,
  } = useHorizontalLayout({
    leftPanel: {
      initialWidth: infoPanelInitialWidth,
      minWidth: infoPanelMinWidth,
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
    heightOffset: 0,
    showingRightmostPanel: showAiTutor2,
  });

  useEffect(() => {
    setLeftPanelSize(
      isStandaloneCollapsed
        ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
        : INITIAL_INFO_PANEL_WIDTH
    );
  }, [isStandaloneCollapsed, setLeftPanelSize]);

  return (
    <div
      className={
        isProjectLevel
          ? moduleStyles.containerWithFooter
          : moduleStyles.defaultContainer
      }
    >
      <div className={moduleStyles.layoutContainer}>
        <InfoPanel
          style={{width: leftPanelWidth}}
          className={classNames(moduleStyles.flexShrink0, panelClassName)}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={leftPanelSeparatorProps}
          isDragging={leftPanelDragging}
        />

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
