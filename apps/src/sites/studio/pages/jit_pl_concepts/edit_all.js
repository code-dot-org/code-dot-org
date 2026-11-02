import React from 'react';

import JitPlConceptEditAll from '@cdo/apps/levelbuilder/jit-pl-concepts-editor/JitPlConceptEditAll';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const jitPlConcepts = getScriptData('jitPlConcepts');

  createReactRoot(
    <JitPlConceptEditAll jitPlConcepts={jitPlConcepts} />,
    document.getElementById('edit-all-jit-pl-concepts')
  );
});
