/**
 * @file Entry point for JotForm embedded iframe.
 */
var formId = document
  .getElementById('jotform-embed')
  .getAttribute('data-formId');
var ifr = document.getElementById(`JotFormIFrame-${formId}`);

if (window.location.href && window.location.href.indexOf('?') > -1) {
  var get = window.location.href.substr(window.location.href.indexOf('?') + 1);
  if (ifr && get.length > 0) {
    var src = ifr.src;
    src = src.indexOf('?') > -1 ? src + '&' + get : src + '?' + get;
    ifr.src = src;
  }
}
window.handleIFrameMessage = function (e) {
  if (typeof e.data === 'object') {
    return;
  }
  var args = e.data.split(':');
  var iframe;
  if (args.length > 2) {
    iframe = document.getElementById('JotFormIFrame-' + args[args.length - 1]);
  } else {
    iframe = document.getElementById('JotFormIFrame');
  }
  if (!iframe) {
    return;
  }
  switch (args[0]) {
    case 'scrollIntoView':
      iframe.scrollIntoView();
      break;
    case 'setHeight':
      iframe.style.height = args[1] + 'px';
      // The setHeight message seems to be sent every time we load the form, so use this
      // to fire the hook we are monitoring to indicate the iframe content has loaded.
      // eslint-disable-next-line
      JotFormFrameLoaded();
      break;
    case 'collapseErrorPage':
      if (iframe.clientHeight > window.innerHeight) {
        iframe.style.height = window.innerHeight + 'px';
      }
      break;
    case 'reloadPage':
      window.location.reload();
      break;
    case 'loadScript':
      var src = args[1];
      if (args.length > 3) {
        src = args[1] + ':' + args[2];
      }
      var script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      document.body.appendChild(script);
      break;
    case 'exitFullscreen':
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      } else if (window.document.mozCancelFullScreen) {
        window.document.mozCancelFullScreen();
      } else if (window.document.mozCancelFullscreen) {
        window.document.mozCancelFullScreen();
      } else if (window.document.webkitExitFullscreen) {
        window.document.webkitExitFullscreen();
      } else if (window.document.msExitFullscreen) {
        window.document.msExitFullscreen();
      }
      break;
  }
  var isJotForm = e.origin.indexOf('jotform') > -1 ? true : false;
  if (
    isJotForm &&
    'contentWindow' in iframe &&
    'postMessage' in iframe.contentWindow
  ) {
    var urls = {
      docurl: encodeURIComponent(document.URL),
      referrer: encodeURIComponent(document.referrer),
    };
    iframe.contentWindow.postMessage(
      JSON.stringify({type: 'urls', value: urls}),
      '*'
    );
  }
};

if (window.addEventListener) {
  window.addEventListener('message', window.handleIFrameMessage, false);
} else if (window.attachEvent) {
  window.attachEvent('onmessage', window.handleIFrameMessage);
}
