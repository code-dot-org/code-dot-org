import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ProgrammingEnvironmentOverview from '@cdo/apps/templates/codeDocs/ProgrammingEnvironmentOverview';
import ExpandableImageDialog from '@cdo/apps/templates/lessonOverview/ExpandableImageDialog';
import instructionsDialog from '@cdo/apps/redux/instructionsDialog';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import {prepareBlocklyForEmbedding} from '@cdo/apps/templates/utils/embeddedBlocklyUtils';

function prepareBlockly() {
  const customBlocksConfig = getScriptData('customBlocksConfig');
  if (!customBlocksConfig) {
    return;
  }
  prepareBlocklyForEmbedding(customBlocksConfig);
}

$(document).ready(() => {
  const store = getStore();
  prepareBlockly();
  const programmingEnvironment = getScriptData('programmingEnvironment');

  ReactDOM.render(
    <ProgrammingEnvironmentOverview
      programmingEnvironment={programmingEnvironment}
    />,
    document.getElementById('container')
  );
  console.log(programmingEnvironment);
});
