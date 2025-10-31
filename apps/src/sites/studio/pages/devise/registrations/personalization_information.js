import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import PersonalizationCollectorContainer from '@cdo/apps/aiDifferentiation/personalization/PersonalizationCollectorContainer';
import {getStore, registerReducers} from '@cdo/apps/redux';
import teachingProfile, {
  fetchTeachingProfileData,
} from '@cdo/apps/templates/teachingProfileRedux';

$(document).ready(() => {
  registerReducers({teachingProfile});
  const store = getStore();
  store.dispatch(fetchTeachingProfileData());
  ReactDOM.render(
    <Provider store={store}>
      <PersonalizationCollectorContainer />
    </Provider>,
    document.getElementById('personalization-information')
  );
});
