import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import MusicLabView from '@cdo/apps/music/views/MusicView';
import Registry from '@cdo/apps/labs/Registry';
import {LocalSourcesStore, S3SourcesStore} from '@cdo/apps/labs/SourcesStore';
import {S3ChannelsStore} from '@cdo/apps/labs/ChannelsStore';
import * as channelsApi from '@cdo/apps/labs/channelsApi';

const applab = 'MgW1shqlxZ7l5P0M8WgBGA';
const javalab = 'gsxRB_wMsPfUI_y4UvWvDw';

$(document).ready(function() {
  window.channelId = 'UZhQ1Ap2xV1VwRzssldBfA';

  // channelsApi.get(applab).then(response => console.log(response));
  // const store = new S3SourcesStore();
  // store.load(applab).then(response => {
  //   console.log(response);
  // });

  const store = new S3ChannelsStore();
  store.load(window.channelId);

  new Registry(new S3SourcesStore());
  console.log(Registry.getInstance());

  ReactDOM.render(
    <MusicLabView />,
    document.getElementById('musiclab-container')
  );
});
