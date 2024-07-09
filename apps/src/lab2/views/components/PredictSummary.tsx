import InstructorsOnly from '@cdo/apps/code-studio/components/InstructorsOnly';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {LinkButton} from '@cdo/apps/componentLibrary/button';
import commonI18n from '@cdo/locale';
import React from 'react';
import moduleStyles from './predict.module.scss';

const SUMMARY_PATH = '/summary';

const PredictSummary: React.FunctionComponent = () => {
  // If viewing the page as Participant, be sure to rewrite the link URL
  // to view as Instructor, so we don't just get redirected back.
  const params = document.location.search.replace(
    `viewAs=${ViewType.Participant}`,
    `viewAs=${ViewType.Instructor}`
  );
  const summaryUrl = document.location.pathname + SUMMARY_PATH + params;

  return (
    <InstructorsOnly>
      <div className={moduleStyles.predictSummaryContainer}>
        <LinkButton
          href={summaryUrl}
          text={commonI18n.viewStudentResponses()}
          size={'s'}
          type={'secondary'}
          color={'black'}
        />
        {/** TODO: Add summary of number of students who submitted a response. */}
      </div>
    </InstructorsOnly>
  );
};

export default PredictSummary;
