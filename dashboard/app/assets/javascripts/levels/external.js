//= require codemirror
//= require_self

// Embed a forum thread in an External level by adding <div id='discourse-comments' /> anywhere in the page html
$(window).load(function () {
  if($('#discourse-comments')[0]) {
    window.discourseUrl = "http://discourse.code.org/";
    window.discourseEmbedUrl = [location.protocol, '//', location.host, location.pathname].join('');
    (function() {
      var d = document.createElement('script'); d.type = 'text/javascript'; d.async = true;
      d.src = discourseUrl + 'javascripts/embed.js';
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
    })();
  }
});
