import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';
import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerReducers({
    instructionsDialog,
  });
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (customBlocksConfig) {
    prepareBlocklyForEmbedding(customBlocksConfig);
  }

  const store = getStore();
  const programmingExpression = getScriptData('programmingExpression');
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
  const currentCategoryKey = getScriptData('currentCategoryKey');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <PageContainer
          programmingEnvironmentTitle={programmingEnvironmentTitle}
          categoriesForNavigation={categoriesForNavigation}
          currentCategoryKey={currentCategoryKey}
          currentDocId={programmingExpression.id}
        >
          <ProgrammingExpressionOverview
            programmingExpression={programmingExpression}
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
