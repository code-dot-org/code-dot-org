import $ from 'jquery';
import { registerGetResult } from '@cdo/apps/code-studio/levels/codeStudioLevels';
import { postMilestoneForPageLoad, onContinue } from '@cdo/apps/code-studio/levels/postOnLoad';

$(document).ready(() => {
  embedDiscourseForum();
  registerGetResult();

  // make milestone post
  postMilestoneForPageLoad();

  // handle click on continue, in particular think about what happens if we didnt
  // hear back
  $(".submitButton").click(onContinue);
});

// Embed a forum thread in an External level by adding <div id='discourse-comments' /> anywhere in the page html
function embedDiscourseForum() {
  if ($('#discourse-comments')[0]) {
    window.discourseUrl = (location.hostname === 'studio.code.org') ? '//forum.code.org/' : '//discourse.code.org/';
    window.discourseEmbedUrl = [location.protocol, '//', location.host, location.pathname].join('');
    (function () {
      var d = document.createElement('script'); d.type = 'text/javascript'; d.async = true;
      d.src = window.discourseUrl + 'javascripts/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
    })();
  }
}
