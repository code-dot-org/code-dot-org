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
const INITIAL_INFO_PANEL_WIDTH = 300;
const INITIAL_INFO_PANEL_WIDTH_WIDGET = 500;
const MIN_EDITOR_WIDTH = 300;
const MIN_PREVIEW_WIDTH = 200;
const INITIAL_PREVIEW_WIDTH = 600;
const INITIAL_PREVIEW_WIDTH_WIDGET = 900;

const VerticalLayout: React.FunctionComponent<LayoutProps> = ({
  isProjectLevel,
  isWidgetView,
}) => {
  const viewMode = useAppSelector(state => state.weblab2.viewMode);
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const dispatch = useAppDispatch();

  const infoPanelInitialWidth = isProjectLevel
    ? 0
    : isWidgetView
    ? INITIAL_INFO_PANEL_WIDTH_WIDGET
    : INITIAL_INFO_PANEL_WIDTH;

  const editorMinWidth = isWidgetView ? 0 : MIN_EDITOR_WIDTH;
  const previewInitialWidth = isWidgetView
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
      minWidth: isProjectLevel ? 0 : MIN_INFO_PANEL_WIDTH,
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
      isWidgetView ? INITIAL_PREVIEW_WIDTH_WIDGET : INITIAL_PREVIEW_WIDTH
    );
  }, [setRightPanelSize, isWidgetView]);

  useEffect(() => {
    if (!isProjectLevel) {
      setLeftPanelSize(
        isWidgetView
          ? INITIAL_INFO_PANEL_WIDTH_WIDGET
          : INITIAL_INFO_PANEL_WIDTH
      );
    } else {
      setLeftPanelSize(0);
    }
  }, [isProjectLevel, setLeftPanelSize, isWidgetView]);

  return (
    <div
      className={
        isProjectLevel
          ? lab2Styles.containerWithFooter
          : lab2Styles.defaultContainer
      }
    >
      <div className={lab2Styles.layoutContainer}>
        {!isProjectLevel && (
          <>
            <InfoPanel
              style={{width: leftPanelWidth}}
              className={classNames(lab2Styles.flexShrink0, panelClassName)}
            />
            <ResizeBar
              isVertical={true}
              separatorProps={leftPanelSeparatorProps}
              isDragging={leftPanelDragging}
            />
          </>
        )}
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
      {isProjectLevel && <div className={lab2Styles.footerArea} />}
    </div>
  );
};

export default VerticalLayout;
