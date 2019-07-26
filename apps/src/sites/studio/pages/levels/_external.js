import $ from 'jquery';
import React from 'react';
import ReactDom from 'react-dom';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import {registerGetResult} from '@cdo/apps/code-studio/levels/codeStudioLevels';
import {
  postMilestoneForPageLoad,
  onContinue
} from '@cdo/apps/code-studio/levels/postOnLoad';

$(document).ready(() => {
  renderMarkdown();
  embedDiscourseForum();
  establishMilestonePost();
});

const renderMarkdown = () => {
  const container = document.getElementById('markdown');
  if (!container || !container.textContent) {
    return;
  }

  const markdown = container.textContent;
  ReactDom.render(
    React.createElement(SafeMarkdown, {markdown}, null),
    container
  );
};

// Embed a forum thread in an External level by adding
// <div id='discourse-comments' /> anywhere in the page html
const embedDiscourseForum = () => {
  if ($('#discourse-comments')[0]) {
    window.discourseUrl =
      location.hostname === 'studio.code.org'
        ? '//forum.code.org/'
        : '//discourse.code.org/';
    window.discourseEmbedUrl = [
      location.protocol,
      '//',
      location.host,
      location.pathname
    ].join('');
    (function() {
      var d = document.createElement('script');
      d.type = 'text/javascript';
      d.async = true;
      d.src = window.discourseUrl + 'javascripts/embed.js';
      (
        document.getElementsByTagName('head')[0] ||
        document.getElementsByTagName('body')[0]
      ).appendChild(d);
    })();
  }
};

const establishMilestonePost = () => {
  const script = document.querySelector('script[data-external]');
  const data = JSON.parse(script.dataset.external);

  // If this is in a level group, we dont need to do anything special for
  // milestone requests
  if (data.in_level_group) {
    return;
  }

  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue (results in navigating to next puzzle)
  $('.submitButton').click(onContinue);
};
