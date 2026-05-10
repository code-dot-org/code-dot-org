import React from 'react';

import SlidesEditor from '@cdo/apps/levelbuilder/lesson-slides-generator/SlidesEditor';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const data = getScriptData('slides');

  // The slides_edit page lives at the same URL family as /slides, so we
  // can derive the sibling URLs by string-substitution rather than
  // threading more fields through the controller.
  const here = window.location.pathname;
  const slidesUrl = here.replace(/\/edit$/, '');
  const generateSlidesUrl = here.replace(/\/slides\/edit$/, '/generate-slides');

  createReactRoot(
    <SlidesEditor
      lessonId={data.lessonId}
      lessonName={data.lessonName}
      initialPanels={data.panels}
      existingSlides={data.slides}
      slidesUrl={slidesUrl}
      generateSlidesUrl={generateSlidesUrl}
      slidesFilePath={data.slidesFilePath}
    />,
    document.getElementById('slides-edit-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
