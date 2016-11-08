/** @file JavaScript run only on the /s/:script_name/edit page. */
/* globals scriptData, i18nData */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from '@cdo/apps/redux';
import reducer from './components/editorRedux';
import ScriptEditor from './components/ScriptEditor';

const store = createStore(reducer, scriptData.stages.filter(stage => stage.id));

ReactDOM.render(
  <Provider store={store}>
    <ScriptEditor
      i18nData={i18nData}
      hidden={scriptData.hidden}
      loginRequired={scriptData.loginRequired}
      hideableStages={scriptData.hideable_stages}
      professionalLearningCourse={scriptData.professionalLearningCourse}
      peerReviewsRequired={scriptData.peerReviewsRequired}
      wrapupVideo={scriptData.wrapupVideo}
    />
  </Provider>,
  document.querySelector('.edit_container')
);
