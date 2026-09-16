import {Button} from '@mui/material';
import React from 'react';

import {createReactRoot} from '@cdo/apps/util/createReactRoot';

function mount() {
  document.querySelectorAll('.badge-link').forEach(container => {
    createReactRoot(
      <Button href={container.dataset.href}>{container.dataset.label}</Button>,
      container
    );
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
