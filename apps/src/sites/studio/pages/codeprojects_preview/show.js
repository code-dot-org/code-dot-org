import React from 'react';
import ReactDOM from 'react-dom';

import InnerHTMLPreview2 from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview2';

window.React = require('react');
window.ReactDOM = require('react-dom');

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <InnerHTMLPreview2 />,
    document.getElementById('codeprojects-preview-container')
  );
});
