import PageNotFound from '@codebridge/FilePreview/PageNotFound';
import React from 'react';
import ReactDOM from 'react-dom';

window.React = require('react');
window.ReactDOM = require('react-dom');
console.log('page_not_found.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <PageNotFound />,
    document.getElementById('page-not-found-container')
  );
});
