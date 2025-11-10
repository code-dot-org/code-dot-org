import PageNotFound from '@codebridge/FilePreview/PageNotFound';
import React from 'react';
import ReactDOM from 'react-dom';

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <PageNotFound />,
    document.getElementById('page-not-found-container')
  );
});
