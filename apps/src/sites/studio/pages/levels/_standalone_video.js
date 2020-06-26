import $ from 'jquery';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  postMilestoneForPageLoad,
  onContinue
} from '@cdo/apps/code-studio/levels/postOnLoad';
import {createVideoWithFallback} from '@cdo/apps/code-studio/videos';
import getScriptData from '@cdo/apps/util/getScriptData';
import React from 'react';
import ReactDom from 'react-dom';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

$(document).ready(() => {
  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue (results in navigating to next puzzle)
  $('.submitButton').click(onContinue);

  // Support toggling between notes and video.
  const showNotes = $('.show-notes');
  const showVideo = $('.show-video');
  const notes = $('.notes-content');
  const video = $('.video-content');

  showNotes.click(() => {
    showNotes.hide();
    showVideo.show();

    notes.show();
    video.hide();

    return false;
  });

  showVideo.click(() => {
    showNotes.show();
    showVideo.hide();

    notes.hide();
    video.show();

    return false;
  });

  const videoOptions = getScriptData('videoOptions');
  const videoWidth = getScriptData('videoWidth');
  const videoHeight = getScriptData('videoHeight');
  const videoFullWidth = getScriptData('videoFullWidth');
  const videoRoundedCorners = getScriptData('videoRoundedCorners');
  createVideoWithFallback(
    $('.video-content'),
    videoOptions,
    videoWidth,
    videoHeight,
    videoFullWidth,
    videoRoundedCorners
  );

  // Render markdown contents
  $('.standalone-video > .markdown-container').each(function() {
    const container = this;
    if (!container.dataset.markdown) {
      return;
    }

    ReactDom.render(
      React.createElement(SafeMarkdown, container.dataset, null),
      container
    );
  });
});
