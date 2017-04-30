import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';

$(document).ready(() => {
  const element = document.getElementById('public-gallery');

  ReactDOM.render(<PublicGallery/>, element);
});
