import React from 'react';
import ReactDOM from 'react-dom';

import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';
import ProgrammingEnvironmentOverview from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentOverview';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import getScriptData from '@cdo/apps/util/getScriptData';

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  prepareBlocklyForEmbedding(customBlocksConfig);
}

$(document).ready(() => {
  prepareBlockly();
  const programmingEnvironment = getScriptData('programmingEnvironment');
  const categoriesForNavigation = getScriptData('categoriesForNavigation');
  ReactDOM.render(
    <PageContainer
      programmingEnvironmentTitle={programmingEnvironment.title}
      categoriesForNavigation={categoriesForNavigation}
    >
      <ProgrammingEnvironmentOverview
        programmingEnvironment={programmingEnvironment}
      />
    </PageContainer>,
    document.getElementById('container')
  );
});
