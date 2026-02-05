import type {FunctionComponent} from 'react';

import {LinkButton} from '@code-dot-org/component-library/button';
import {useApiClient, useSectionSummary} from '@code-dot-org/core/api';
import {ViewType} from '@code-dot-org/progress';

import {useAppSelector} from '../../redux/store';

import moduleStyles from './predict-summary.module.scss';

const SUMMARY_PATH = '/summary';

const PredictSummary: FunctionComponent = () => {
  // If viewing the page as Participant, be sure to rewrite the link URL
  // to view as Instructor, so we don't just get redirected back.
  const params = document.location.search.replace(
    `viewAs=${ViewType.Participant}`,
    `viewAs=${ViewType.Instructor}`,
  );
  const summaryUrl = document.location.pathname + SUMMARY_PATH + params;
  const currentSectionId = useAppSelector(
    state => state.teacherSections.selectedSectionId,
  );
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  const api = useApiClient();
  const {data, isSuccess} = useSectionSummary(
    api,
    {
      sectionId: currentSectionId || 0,
      levelId: currentLevelId || 0,
    },
    {
      enabled: !!currentSectionId && !!currentLevelId,
    },
  );

  return (
    <div className={moduleStyles.predictSummaryContainer}>
      {isSuccess && (
        <div className={moduleStyles.responses}>
          <div className={moduleStyles.responseIcon}>
            <i className="fa fa-user" />
          </div>
          <div>
            <span className={moduleStyles.responseCount}>
              {data.responseCount}/{data.numStudents}{' '}
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
