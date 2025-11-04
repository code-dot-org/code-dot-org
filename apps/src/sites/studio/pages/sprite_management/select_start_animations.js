import queryString from 'query-string';
import React from 'react';

import SelectStartAnimations from '@cdo/apps/code-studio/assets/SelectStartAnimations';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const query = queryString.parse(window.location.search);
  const useAllSprites = query['library'] === 'all';
  createReactRoot(
    <SelectStartAnimations useAllSprites={useAllSprites} />,
    document.getElementById('select_start_animations')
  );
});
