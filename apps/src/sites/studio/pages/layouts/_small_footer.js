import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import SmallFooter from '@cdo/apps/code-studio/components/SmallFooter';

// Note: We're not waiting for document.ready; we expect this script to be inlined into
// the DOM immediately after the necessary #page-small-footer markup.
ReactDOM.render(
  <SmallFooter {...getScriptData('smallfooter')} />,
  document.getElementById('page-small-footer')
);
