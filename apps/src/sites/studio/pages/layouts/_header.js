import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ProjectInfo from '@cdo/apps/code-studio/components/header/ProjectInfo';
import {getStore} from '@cdo/apps/redux';
import firehoseClient from '@cdo/apps/lib/util/firehose';

const container = document.getElementsByClassName('project_info');
if (container.length) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <ProjectInfo />
    </Provider>,
    container[0]
  );
}

document.querySelectorAll('.headerlink').forEach(link => {
  console.log(link);
  link.addEventListener('click', event => {
    console.log(event);
    console.log(event.target.id);
    event.preventDefault();
    firehoseClient.putRecord({
      study: 'navigation_bar_not_on_the_edge',
      event: event.target.dataset.linkTitle,
      data_json: event.target.dataset.secondaryLink
    });
  });
});
