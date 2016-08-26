import $ from 'jquery';

// Embed a forum thread in an External level by adding <div id='discourse-comments' /> anywhere in the page html
$(window).load(function () {
  if ($('#discourse-comments')[0]) {
    window.discourseUrl = (location.hostname === 'studio.code.org') ? '//forum.code.org/' : '//discourse.code.org/';
    window.discourseEmbedUrl = [location.protocol, '//', location.host, location.pathname].join('');
    (function () {
      var d = document.createElement('script'); d.type = 'text/javascript'; d.async = true;
      d.src = window.discourseUrl + 'javascripts/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
    })();
  }
});
