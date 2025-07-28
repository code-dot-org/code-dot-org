import React, {FC} from 'react';
import {Outlet, useLocation} from 'react-router-dom';

import {WorkshopTabs} from './components/WorkshopTabs';
import {SurveyCategorySelection} from './surveys/components/SurveyCategorySelection';
import {SurveyTypeSelection} from './surveys/components/SurveyTypeSelection';
import {FacilitatorSelection} from './surveys/post/facilitators/components/FacilitatorSelection';
import {WorkshopLayoutProps} from './types';

export const WorkshopLayout: FC<WorkshopLayoutProps> = ({
  tabList,
  surveyTypeOptions,
  questionCategoryButtons,
}) => {
  const {pathname} = useLocation();

  const showSurveyTypeSelection = pathname.includes('/surveys');
  const showCategorySelection = pathname.includes('/surveys/post');
  const showFacilitatorSelection = pathname.includes(
    '/surveys/post/facilitators'
  );
  return (
    <>
      <nav aria-label="Workshop sections">
        <WorkshopTabs tabList={tabList} />
        {showSurveyTypeSelection && (
          <SurveyTypeSelection surveyTypeOptions={surveyTypeOptions} />
        )}
        {showCategorySelection && (
          <SurveyCategorySelection
            questionCategoryButtons={questionCategoryButtons}
          />
        )}
        {showFacilitatorSelection && <FacilitatorSelection />}
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
};
