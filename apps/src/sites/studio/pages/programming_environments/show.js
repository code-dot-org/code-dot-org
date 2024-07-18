import React from 'react';
import {createRoot} from 'react-dom/client';

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
  const root = createRoot(document.getElementById('container'));

  root.render(
    <PageContainer
      programmingEnvironmentTitle={programmingEnvironment.title}
      categoriesForNavigation={categoriesForNavigation}
    >
      <ProgrammingEnvironmentOverview
        programmingEnvironment={programmingEnvironment}
      />
    </PageContainer>
  );
});
