import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {LinkButton} from '@cdo/apps/componentLibrary/button';
import {getSectionSummary} from '@cdo/apps/lab2/projects/userLevelsApi';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';

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
  const currentSectionId = useSelector(
    (state: {teacherSections: {selectedSectionId: number}}) =>
      state.teacherSections.selectedSectionId
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
      <LinkButton
        href={summaryUrl}
        text={commonI18n.viewStudentResponses()}
        size={'xs'}
        type={'secondary'}
        color={'black'}
        className={moduleStyles.studentResponsesButton}
      />
      {responseCount !== null && numStudents !== null && (
        <div className={moduleStyles.responses}>
          <div className={moduleStyles.responseIcon}>
            <i className="fa fa-user" />
          </div>
          <div>
            <span className={moduleStyles.responseCount}>
              {responseCount}/{numStudents}
            </span>
            <span className={moduleStyles.responseLabel}>
              {commonI18n.studentsAnswered()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictSummary;
