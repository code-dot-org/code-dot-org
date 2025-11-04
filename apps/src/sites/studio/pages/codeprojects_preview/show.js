import React from 'react';

import InnerHTMLPreview from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

window.React = require('react');
window.ReactDOM = require('react-dom');

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <InnerHTMLPreview />,
    document.getElementById('codeprojects-preview-container')
  );
});
