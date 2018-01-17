import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import FeaturedProjects from '@cdo/apps/templates/projects/FeaturedProjects';

$(document).ready(function () {
  ReactDOM.render(
    <FeaturedProjects/>,
    document.getElementById('featured-projects-container')
  );
});
