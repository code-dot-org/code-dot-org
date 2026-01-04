import React, {useEffect, useState} from 'react';

import {getSectionSummary} from '@code-dot-org/api/userLevels';
import {LinkButton} from '@code-dot-org/component-library/button';
import {ViewType} from '@code-dot-org/progress';

import {useAppSelector} from '../../redux/store';

import moduleStyles from './predict-summary.module.scss';

const SUMMARY_PATH = '/summary';

const PredictSummary: React.FunctionComponent = () => {
  // If viewing the page as Participant, be sure to rewrite the link URL
  // to view as Instructor, so we don't just get redirected back.
  const params = document.location.search.replace(
    `viewAs=${ViewType.Participant}`,
    `viewAs=${ViewType.Instructor}`
  );
  const summaryUrl = document.location.pathname + SUMMARY_PATH + params;
  const currentSectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId
  );
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [numStudents, setNumStudents] = useState<number | null>(null);

  useEffect(() => {
    if (currentSectionId && currentLevelId) {
      try {
        getSectionSummary(currentSectionId, currentLevelId).then(response => {
          if (response?.value) {
            setResponseCount(response.value.response_count);
            setNumStudents(response.value.num_students);
          } else {
            resetSummary();
          }
        });
      } catch (e) {
        resetSummary();
      }
    } else {
      resetSummary();
    }
  }, [currentSectionId, currentLevelId]);

  const resetSummary = () => {
    setResponseCount(null);
    setNumStudents(null);
  };

  return (
    <div className={moduleStyles.predictSummaryContainer}>
      {responseCount !== null && numStudents !== null && (
        <div className={moduleStyles.responses}>
          <div className={moduleStyles.responseIcon}>
            <i className="fa fa-user" />
          </div>
          <div>
            <span className={moduleStyles.responseCount}>
              {responseCount}/{numStudents}{' '}
            </span>
            <span className={moduleStyles.responseLabel}>
              students answered
            </span>
          </div>
        </div>
      )}
      <LinkButton
        href={summaryUrl}
        text="View student responses"
        size={'s'}
        type={'secondary'}
        color={'black'}
        className={moduleStyles.studentResponsesButton}
      />
    </div>
  );
};

export default PredictSummary;
