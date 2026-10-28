import React from 'react';

import PageContainer from '@cdo/apps/templates/codeDocs/PageContainer';
import ProgrammingEnvironmentOverview from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentOverview';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  const programmingEnvironmentName = getScriptData(
    'programmingEnvironment'
  ).name;
  prepareBlocklyForEmbedding(customBlocksConfig, programmingEnvironmentName);
}

$(document).ready(() => {
  prepareBlockly();
  const programmingEnvironment = getScriptData('programmingEnvironment');
  const categoriesForNavigation = getScriptData('categoriesForNavigation');
  createReactRoot(
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
