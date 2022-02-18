import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingEnvironmentOverview from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentOverview';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';

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

  ReactDOM.render(
    <ProgrammingEnvironmentOverview
      programmingEnvironment={programmingEnvironment}
    />,
    document.getElementById('container')
  );
});
