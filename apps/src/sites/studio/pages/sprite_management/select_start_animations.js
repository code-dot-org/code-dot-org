import React from 'react';
import ReactDOM from 'react-dom';
import SelectStartAnimations from '@cdo/apps/code-studio/assets/SelectStartAnimations';
import queryString from 'query-string';

$(document).ready(function() {
  const query = queryString.parse(window.location.search);
  const useAllSprites = query['library'] === 'all';
  ReactDOM.render(
    <SelectStartAnimations useAllSprites={useAllSprites} />,
    document.getElementById('select_start_animations')
  );
});
