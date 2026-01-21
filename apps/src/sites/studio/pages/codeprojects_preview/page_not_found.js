import { createRoot } from "react-dom/client";
import PageNotFound from '@codebridge/FilePreview/PageNotFound';
import React from 'react';
import ReactDOM from 'react-dom';

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('page-not-found-container'));
  root.render(<PageNotFound />);
});
