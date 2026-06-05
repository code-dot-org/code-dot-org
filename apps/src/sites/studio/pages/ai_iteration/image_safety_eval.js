import React from 'react';

import ImageSafetyEvalApp from '@cdo/apps/aichat/evals/ImageSafetyEvalApp';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

const mount = () => {
  const container = document.getElementById('image-safety-eval');
  if (container) {
    createReactRoot(<ImageSafetyEvalApp />, container);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
