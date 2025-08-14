import React from 'react';
import ReactDOM from 'react-dom';

import InnerHTMLPreview from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <InnerHTMLPreview />,
    document.getElementById('codeprojects-preview-container')
  );
});
