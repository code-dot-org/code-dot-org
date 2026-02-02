import React from 'react';
import ReactDOM from 'react-dom';

import InnerHTMLPreview from '@cdo/apps/weblab2/htmlPreview/InnerHTMLPreview';

window.React = require('react');
window.ReactDOM = require('react-dom');

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <InnerHTMLPreview />,
    document.getElementById('codeprojects-preview-container')
  );
});
