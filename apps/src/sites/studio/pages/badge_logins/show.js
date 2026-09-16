import React from 'react';

import BadgeLoginPage from '@cdo/apps/templates/badges/BadgeLoginPage';
import protectPrivatePage from '@cdo/apps/templates/badges/protectPrivatePage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

function mount() {
  protectPrivatePage();
  const container = document.getElementById('badge-login-page');
  if (container) {
    createReactRoot(
      <BadgeLoginPage {...JSON.parse(container.dataset.badgePage)} />,
      container
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
