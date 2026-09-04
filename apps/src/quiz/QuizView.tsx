import classNames from 'classnames';
import React, {useRef} from 'react';
import {useResizable} from 'react-resizable-layout';

import {getAppOptionsIsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import ResizeBar from '@cdo/apps/lab2/views/components/layout/ResizeBar';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import useQuizAttemptView from './attempt/useQuizAttemptView';
import useQuizBuilderView from './builder/useQuizBuilderView';

import styles from './quiz-view.module.scss';

// Floor for the resource panel's drag-resizable width, in px - also its
// starting width.
const RESOURCE_PANEL_MIN_WIDTH = 350;

// Shared shell for both quiz modes - build and attempt.
const QuizView: React.FunctionComponent<LabProps> = props => {
  const isBuilderMode = !!getAppOptionsIsBuildingQuizQuestions();
  // isBuilderMode comes from a static script tag, not state, so it can't
  // change across renders of a mounted Quiz - call both to keep the hooks
  // unconditional, and use whichever one applies.
  const builderView = useQuizBuilderView(props);
  const attemptView = useQuizAttemptView(props);
  const {resourcePanelProps, workspaceContent} = isBuilderMode
    ? builderView
    : attemptView;

  const isResourcePanelCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    position: resourcePanelWidth,
    separatorProps: resourcePanelSeparatorProps,
    isDragging: isResizingResourcePanel,
  } = useResizable({
    axis: 'x',
    containerRef,
    initial: RESOURCE_PANEL_MIN_WIDTH,
    min: RESOURCE_PANEL_MIN_WIDTH,
    disabled: isResourcePanelCollapsed,
  });

  return (
    <div className={styles.quiz} ref={containerRef}>
      <div
        className={classNames(
          styles.resourcePanel,
          isResourcePanelCollapsed && styles.resourcePanelCollapsed
        )}
        style={
          isResourcePanelCollapsed ? undefined : {width: resourcePanelWidth}
        }
      >
        <ResourcePanel
          levelProperties={props.levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
          hideAllNavigation
          {...resourcePanelProps}
        />
      </div>
      {isResourcePanelCollapsed ? (
        <div className={styles.divider} />
      ) : (
        <ResizeBar
          isVertical
          isDragging={isResizingResourcePanel}
          separatorProps={resourcePanelSeparatorProps}
        />
      )}
      <div className={styles.content}>{workspaceContent}</div>
    </div>
  );
};

export default QuizView;
