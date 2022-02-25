import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';
import ProgrammingExpressionOverview from '@cdo/apps/templates/codeDocs/ProgrammingExpressionOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';

$(document).ready(() => {
  registerReducers({
    instructionsDialog
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
  const categoriesForNavigation = getScriptData('categoriesForNavigation');
  const currentCategoryKey = getScriptData('currentCategoryKey');
  ReactDOM.render(
    <Provider store={store}>
      <>
        <PageContainer
          programmingEnvironmentTitle={programmingEnvironmentTitle}
          categoriesForNavigation={categoriesForNavigation}
          currentCategoryKey={currentCategoryKey}
        >
          <ProgrammingExpressionOverview
            programmingExpression={programmingExpression}
          />
        </PageContainer>
        <ExpandableImageDialog />
      </>
    </Provider>,
    document.getElementById('show-container')
  );
});
