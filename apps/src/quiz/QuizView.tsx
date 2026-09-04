import React from 'react';

import {getAppOptionsIsBuildingQuizQuestions} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';

import useQuizAttemptView from './attempt/useQuizAttemptView';
import useQuizBuilderView from './builder/useQuizBuilderView';

import styles from './quiz-view.module.scss';

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

  return (
    <div className={styles.quiz}>
      <div className={styles.resourcePanel}>
        <ResourcePanel
          levelProperties={props.levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
          hideAllNavigation
          {...resourcePanelProps}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.content}>{workspaceContent}</div>
    </div>
  );
};

export default QuizView;
