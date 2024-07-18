import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';
import ProgrammingClassOverview from '@cdo/apps/templates/codeDocs/ProgrammingClassOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import getScriptData, {hasScriptData} from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
  });

  const store = getStore();
  const programmingClass = getScriptData('programmingClass');
  const programmingEnvironmentTitle = getScriptData(
    'programmingEnvironmentTitle'
  );
  const programmingEnvironmentName = getScriptData(
    'programmingEnvironmentName'
  );
  const programmingEnvironmentLanguage = getScriptData(
    'programmingEnvironmentLanguage'
  );

  const categoriesForNavigation = getScriptData('categoriesForNavigation');
  const currentCategoryKey = hasScriptData('currentCategoryKey')
    ? getScriptData('currentCategoryKey')
    : null;
  ReactDOM.render(
    <Provider store={store}>
      <>
        <PageContainer
          programmingEnvironmentTitle={programmingEnvironmentTitle}
          categoriesForNavigation={categoriesForNavigation}
          currentCategoryKey={currentCategoryKey}
        >
          <ProgrammingClassOverview
            programmingClass={programmingClass}
            programmingEnvironmentName={programmingEnvironmentName}
            programmingEnvironmentLanguage={programmingEnvironmentLanguage}
          />
        </PageContainer>
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('show-container')
  );
});
