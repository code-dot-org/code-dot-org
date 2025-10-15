import SegmentedButtons, {
  SegmentedButtonsProps,
} from '@code-dot-org/component-library/segmentedButtons';
import Typography from '@code-dot-org/component-library/typography';
import {InfoPanel} from '@codebridge/InfoPanel/InfoPanel';
import {LayoutProps} from '@codebridge/types';
import HeaderButtons from '@codebridge/Workspace/HeaderButtons';
import Workspace from '@codebridge/Workspace/Workspace';
import classNames from 'classnames';
import React, {useEffect} from 'react';

import {HTMLPreview} from '@cdo/apps/codebridge/FilePreview/HTMLPreview';
import {useVerticalLayout} from '@cdo/apps/lab2/hooks/useVerticalLayout';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import weblab2I18n from '@cdo/apps/weblab2/locale';

import {setViewMode} from '../redux';
import {ViewMode} from '../types';

import lab2Styles from '@cdo/apps/lab2/views/components/layout/layout.module.scss';
import weblab2Styles from '@cdo/apps/weblab2/layout/vertical-layout.module.scss';

const MIN_INFO_PANEL_WIDTH = 150;
const INITIAL_INFO_PANEL_WIDTH = 400;
const INITIAL_INFO_PANEL_WIDTH_WIDGET = 500;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 320;
const INITIAL_PREVIEW_WIDTH = 400;
const INITIAL_PREVIEW_WIDTH_WIDGET = 900;
const INITIAL_INFO_PANEL_WIDTH_COLLAPSED = 55;
const INITIAL_PREVIEW_WIDTH_COLLAPSED = 650;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isWidgetView,
}) => {
  const viewMode = useAppSelector(state => state.weblab2.viewMode);
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const dispatch = useAppDispatch();

  const infoPanelInitialWidth = isStandaloneCollapsed
    ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
    : isWidgetView
    ? INITIAL_INFO_PANEL_WIDTH_WIDGET
    : INITIAL_INFO_PANEL_WIDTH;

  const editorMinWidth = isWidgetView ? 0 : MIN_EDITOR_WIDTH;
  const previewInitialWidth = isStandaloneCollapsed
    ? INITIAL_PREVIEW_WIDTH_COLLAPSED
    : isWidgetView
    ? INITIAL_PREVIEW_WIDTH_WIDGET
    : INITIAL_PREVIEW_WIDTH;

  const {
    leftPanelWidth,
    middlePanelWidth,
    rightPanelWidth,
    leftPanelSeparatorProps,
    leftPanelDragging,
    setRightPanelSize,
    setLeftPanelSize,
    rightPanelSeparatorProps,
    rightPanelDragging,
    panelClassName,
  } = useVerticalLayout({
    leftPanel: {
      minWidth: MIN_INFO_PANEL_WIDTH,
      initialWidth: infoPanelInitialWidth,
      name: 'instructions',
    },
    middlePanel: {
      minWidth: editorMinWidth,
      name: 'editor',
    },
    rightPanel: {
      minWidth: MIN_PREVIEW_WIDTH,
      initialWidth: previewInitialWidth,
      name: 'preview',
    },
    appName: 'weblab2',
  });

  const viewModeButtonsProps: SegmentedButtonsProps = {
    buttons: [
      {
        label: weblab2I18n.code(),
        value: ViewMode.CODE,
        iconLeft: {
          iconName: 'code',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.preview(),
        value: ViewMode.PREVIEW,
        iconLeft: {
          iconName: 'eye',
          iconStyle: 'solid',
        },
      },
      {
        label: weblab2I18n.splitView(),
        value: ViewMode.SPLIT,
        iconLeft: {
          iconName: 'table-columns',
          iconStyle: 'solid',
        },
      },
    ],
    size: 'xs',
    selectedButtonValue: viewMode,
    onChange: viewMode => dispatch(setViewMode(viewMode as ViewMode)),
  };

  useEffect(() => {
    setRightPanelSize(
      isStandaloneCollapsed
        ? INITIAL_PREVIEW_WIDTH_COLLAPSED
        : isWidgetView
        ? INITIAL_PREVIEW_WIDTH_WIDGET
        : INITIAL_PREVIEW_WIDTH
    );
  }, [setRightPanelSize, isWidgetView, isStandaloneCollapsed]);

  useEffect(() => {
    setLeftPanelSize(
      isStandaloneCollapsed
        ? INITIAL_INFO_PANEL_WIDTH_COLLAPSED
        : isWidgetView
        ? INITIAL_INFO_PANEL_WIDTH_WIDGET
        : INITIAL_INFO_PANEL_WIDTH
    );
  }, [setLeftPanelSize, isWidgetView, isStandaloneCollapsed]);

  return (
    <div className={lab2Styles.defaultContainer}>
      <div className={lab2Styles.layoutContainer}>
        <InfoPanel
          style={{width: leftPanelWidth}}
          className={classNames(lab2Styles.flexShrink0, panelClassName)}
        />
        <ResizeBar
          isVertical={true}
          separatorProps={leftPanelSeparatorProps}
          isDragging={leftPanelDragging}
        />

        <div
          className={classNames(
            lab2Styles.flexColumn,
            lab2Styles.shrinkAndGrow
          )}
        >
          <div className={weblab2Styles.headerContainer}>
            {isWidgetView ? (
              <span />
            ) : (
              <SegmentedButtons {...viewModeButtonsProps} />
            )}
            <div className={weblab2Styles.centerHeaderContent}>
              <Typography
                semanticTag="h2"
                visualAppearance="overline-two"
                noMargin
                className={classNames(
                  weblab2Styles.headerLabel,
                  weblab2Styles.centerHeaderContentText
                )}
              >
                {weblab2I18n.workspace()}
              </Typography>
              {projectTemplateLevel && <ProjectTemplateWorkspaceIconV2 />}
            </div>
            <HeaderButtons />
          </div>
          <div className={weblab2Styles.editorAndPreviewContainer}>
            {!isWidgetView && viewMode !== ViewMode.PREVIEW && (
              <>
                <Workspace
                  style={{width: middlePanelWidth}}
                  className={classNames(
                    lab2Styles.shrinkAndGrow,
                    panelClassName
                  )}
                  hideHeaders
                />
                <ResizeBar
                  isVertical={true}
                  separatorProps={rightPanelSeparatorProps}
                  isDragging={rightPanelDragging}
                />
              </>
            )}
            {viewMode !== ViewMode.CODE && (
              <div
                style={{width: rightPanelWidth}}
                className={classNames(lab2Styles.shrinkAndGrow, panelClassName)}
              >
                <HTMLPreview />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalLayout;
