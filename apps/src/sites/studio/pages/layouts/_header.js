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

function recordLinkEvent(link, studyText, eventText) {
  link.addEventListener('click', event => {
    console.log(event);
    console.log(event.target.id);
    //debugger;
    firehoseClient.putRecord(
      {
        study: studyText,
        event: eventText,
        data_json: JSON.stringify({
          tab_title: event.target.dataset.linkTitle,
          link_url: event.target.dataset.secondaryLink
        })
      },
      {alwaysPut: true} // For testing purposes to confirm data is logged to firehose.  Remove before merging PR
    );
  });
}

// Progress, Course catalog, Dashboard & Professional Learning links
document.querySelectorAll('.headerlink').forEach(link => {
  console.log(link);

  recordLinkEvent(link, 'nav_bar', 'header_links');
});

// dashboard logo
document.querySelectorAll('.header_logo').forEach(link => {
  console.log(link);
  //debugger;
  recordLinkEvent(link, 'nav_bar', 'dashboard_logo');
});

// create menu

// help button
document.querySelectorAll('.linktag').forEach(link => {
  console.log(link);
  //debugger;
  recordLinkEvent(link, 'nav_bar', 'help_button');
});

// hamburger menu
