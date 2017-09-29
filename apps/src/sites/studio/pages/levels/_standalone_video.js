import $ from 'jquery';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { postMilestoneForPageLoad, onContinue } from '@cdo/apps/code-studio/levels/postOnLoad';
import { createVideoWithFallback } from '@cdo/apps/code-studio/videos';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue (results in navigating to next puzzle)
  $(".submitButton").click(onContinue);

  // Support toggling between notes and video.
  const showNotes = $(".show-notes");
  const showVideo = $(".show-video");
  const notes = $(".notes-content");
  const video = $(".video-content");

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
  createVideoWithFallback($('.video-content'), videoOptions, videoWidth, videoHeight);
});
