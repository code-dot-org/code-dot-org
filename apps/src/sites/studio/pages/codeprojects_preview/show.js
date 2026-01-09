import React from 'react';
import ReactDOM from 'react-dom';

import InnerHTMLPreview from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview';
import InnerHTMLPreview2 from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview2';
import experiments from '@cdo/apps/util/experiments';

window.React = require('react');
window.ReactDOM = require('react-dom');

const useLegacyPreview = experiments.isEnabledAllowingQueryString(
  experiments.WEBLAB2_LEGACY_PREVIEW
);

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    useLegacyPreview ? <InnerHTMLPreview /> : <InnerHTMLPreview2 />,
    document.getElementById('codeprojects-preview-container')
  );
});
