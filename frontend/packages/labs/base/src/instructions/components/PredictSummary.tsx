import type {FunctionComponent} from 'react';
import {useEffect, useReducer} from 'react';

import {getSectionSummary} from '@code-dot-org/api/userLevels';
import {LinkButton} from '@code-dot-org/component-library/button';
import {ViewType} from '@code-dot-org/progress';

import {useAppSelector} from '../../redux/store';

import moduleStyles from './predict-summary.module.scss';

const SUMMARY_PATH = '/summary';

type SummaryState = {
  responseCount: number | null;
  numStudents: number | null;
};

type SummaryAction =
  | {type: 'reset'}
  | {type: 'loaded'; responseCount: number; numStudents: number};

const initialState: SummaryState = {responseCount: null, numStudents: null};

function summaryReducer(
  _state: SummaryState,
  action: SummaryAction,
): SummaryState {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'loaded':
      return {
        responseCount: action.responseCount,
        numStudents: action.numStudents,
      };
  }
}

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
  const [{responseCount, numStudents}, dispatch] = useReducer(
    summaryReducer,
    initialState,
  );

  useEffect(() => {
    if (currentSectionId && currentLevelId) {
      dispatch({type: 'reset'});
      try {
        getSectionSummary(currentSectionId, currentLevelId).then(response => {
          if (response?.value) {
            dispatch({
              type: 'loaded',
              responseCount: response.value.response_count,
              numStudents: response.value.num_students,
            });
          } else {
            dispatch({type: 'reset'});
          }
        });
      } catch {
        dispatch({type: 'reset'});
      }
    } else {
      dispatch({type: 'reset'});
    }
  }, [currentSectionId, currentLevelId]);

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
