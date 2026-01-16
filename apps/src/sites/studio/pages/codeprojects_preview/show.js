import React from 'react';

import InnerHTMLPreview from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview';
import InnerHTMLPreview2 from '@cdo/apps/codebridge/FilePreview/InnerHTMLPreview2';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import experiments from '@cdo/apps/util/experiments';

window.React = require('react');
window.ReactDOM = require('react-dom');

const useLegacyPreview = experiments.isEnabledAllowingQueryString(
  experiments.WEBLAB2_LEGACY_PREVIEW
);

document.addEventListener('DOMContentLoaded', () => {
  createReactRoot(
    useLegacyPreview ? <InnerHTMLPreview /> : <InnerHTMLPreview2 />,
    document.getElementById('codeprojects-preview-container')
  );
});
