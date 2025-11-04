import React from 'react';

import SmallFooter from '@cdo/apps/code-studio/components/SmallFooter';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

// Note: We're not waiting for document.ready; we expect this script to be inlined into
// the DOM immediately after the necessary #page-small-footer markup.
createReactRoot(
  <SmallFooter {...getScriptData('smallfooter')} />,
  document.getElementById('page-small-footer')
);
