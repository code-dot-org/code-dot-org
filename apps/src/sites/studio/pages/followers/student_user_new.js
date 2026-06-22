import React from 'react';

import JoinSectionForm from '@cdo/apps/templates/sections/JoinSectionForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

function mount() {
  const script = document.querySelector('script[data-joinsection]');
  const data = JSON.parse(script.dataset.joinsection);

  createReactRoot(
    <JoinSectionForm {...data} />,
    document.getElementById('join-section-form'),
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
