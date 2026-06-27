import React from 'react';

import SectionSignIn from '@cdo/apps/templates/sections/SectionSignIn';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

function mount() {
  const script = document.querySelector('script[data-section]');
  const data = JSON.parse(script.dataset.section);

  createReactRoot(
    <SectionSignIn {...data} />,
    document.getElementById('section-sign-in'),
    {legacyReactDomRender: true}
  );
}

// The entry script tag precedes the mount-point div in the view, so wait for
// the document to finish parsing before looking it up.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
