import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import InnerHTMLPreview from '@cdo/apps/weblab2/htmlPreview/InnerHTMLPreview';

window.React = require('react');
window.ReactDOM = require('react-dom');

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    <InnerHTMLPreview />,
    document.getElementById('codeprojects-preview-container')
  );
});
