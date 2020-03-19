import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import ScriptName from '@cdo/apps/code-studio/components/header/ScriptName';
import getScriptData from '@cdo/apps/util/getScriptData';
import {getStore} from '@cdo/apps/redux';
import createPubSub from '@cdo/apps/lib/util/PubSubService';

const container = document.getElementsByClassName('script_name_container');
if (container.length) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <ScriptName {...getScriptData('scriptname')} />
    </Provider>,
    container[0]
  );

  if (true) {
    const usersIcon = document.createElement('i');
    usersIcon.className = 'fa fa-fw fa-users';
    const userCount = document.createElement('span');
    userCount.textContent = '0';
    const userCountDiv = document.createElement('div');
    userCountDiv.appendChild(usersIcon);
    userCountDiv.appendChild(userCount);
    userCountDiv.style.marginRight = '1em';
    container[0].parentNode.insertBefore(userCountDiv, container[0]);

    const pubSub = createPubSub(getScriptData('pubSub'));
    const channel = pubSub.subscribe(`presence-test`);

    let users = 0;
    const updateUserCount = () => {
      userCount.textContent = String(users);
      if (users > 1) {
        usersIcon.className = 'fa fa-fw fa-users';
      } else {
        usersIcon.className = 'fa fa-fw fa-user';
      }
    };

    channel.subscribe('pusher:subscription_succeeded', members => {
      users = members.count;
      updateUserCount();
    });
    channel.subscribe('pusher:member_added', () => {
      users++;
      updateUserCount();
    });
    channel.subscribe('pusher:member_removed', () => {
      users--;
      updateUserCount();
    });
  }
}
