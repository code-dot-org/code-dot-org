import React from 'react';

import BadgeSessionNotice from '@cdo/apps/templates/badges/BadgeSessionNotice';
import protectPrivatePage from '@cdo/apps/templates/badges/protectPrivatePage';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

const mount = () => {
  protectPrivatePage();
  const element = document.getElementById('badge-session-notice');
  if (element) {
    createReactRoot(
      <BadgeSessionNotice {...JSON.parse(element.dataset.badgeSession)} />,
      element
    );
  }
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
