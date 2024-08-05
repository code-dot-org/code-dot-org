import queryString from 'query-string';
import React from 'react';
import {createRoot} from 'react-dom/client';

import SelectStartAnimations from '@cdo/apps/code-studio/assets/SelectStartAnimations';

$(document).ready(function () {
  const query = queryString.parse(window.location.search);
  const useAllSprites = query['library'] === 'all';
  const root = createRoot(document.getElementById('select_start_animations'));
  root.render(<SelectStartAnimations useAllSprites={useAllSprites} />);
});
