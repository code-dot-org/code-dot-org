import React from 'react';
import ReactDOM from 'react-dom';

import InnerHTMLPreview from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview';
import InnerHTMLPreview2 from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview2';
import experiments from '@cdo/apps/util/experiments';

window.React = require('react');
window.ReactDOM = require('react-dom');
const useWeblab2PreviewV2 = experiments.isEnabledAllowingQueryString(
  experiments.WEBLAB2_PREVIEW_V2
);
console.log({useWeblab2PreviewV2});

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    useWeblab2PreviewV2 ? <InnerHTMLPreview2 /> : <InnerHTMLPreview />,
    document.getElementById('codeprojects-preview-container')
  );
});
