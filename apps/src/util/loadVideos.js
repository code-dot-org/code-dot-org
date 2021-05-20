import testImageAccess from '../code-studio/url_test';

// forcePlayer can be "youtube", "fallback", or false if we just want to
// detect the appropriate player.
export function loadVideos(forcePlayer) {
  if (forcePlayer) {
    setupVideos(forcePlayer);
  } else {
    testImageAccess(
      'https://www.youtube-nocookie.com/favicon.ico?' + Math.random(),
      function() {
        setupVideos('youtube');
      },
      function() {
        setupVideos('fallback');
      }
    );
  }
}

// Set up appropriate video players by inserting them into the DOM alongside all items with
// class "insert_video_player".
// Such insertion points have two attributes:
//   data-video_code with the youtube ID, and
//   data-download_path with a full URL to an mp4 video.
// Parameter player is either "youtube" or "fallback".
function setupVideos(player) {
  if (player === 'fallback') {
    const doc = document;
    let video_css = doc.createElement('link');
    let video = doc.createElement('script');

    video_css.type = 'text/css';
    video_css.href = '/css/video-js.min.css';
    video_css.rel = 'stylesheet';
    doc.getElementsByTagName('head')[0].appendChild(video_css);
    video.type = 'text/javascript';
    video.src = '/js/video.min.js';
    doc.body.appendChild(video);
  }

  $('.insert_video_player').each(function() {
    const downloadPath = $(this).data('download-path');

    // Use fallback player if that's the preference.
    // It requires a downloadPath, and it doesn't seem to work on IE8 because
    // it relies upon a missing addEventListener.
    if (player === 'fallback' && downloadPath && window.addEventListener) {
      $(this)
        .parent()
        .append(
          '<video ' +
            'style="position:absolute; top: 0; left: 0; width: 100%; height: 100%" ' +
            'width="100%" height="100%" ' +
            'class="video-js lazyload vjs-big-play-centered" ' +
            'preload="none" ' +
            'data-setup=\'{"nativeControlsForTouch": true}\' ' +
            'controls>' +
            '  <source src="' +
            downloadPath +
            '" type="video/mp4"/>' +
            '</video>'
        );
    } else {
      // Always default to YouTube player.
      $(this)
        .parent()
        .append(
          '<iframe class="lazyload" ' +
            'style="position:absolute; top: 0; left: 0; width: 100%; height: 100%" ' +
            `data-src="https://www.youtube-nocookie.com/embed/${$(this).data(
              'video-code'
            )}?iv_load_policy=3&rel=0&autohide=1&showinfo=0&enablejsapi=1" ` +
            'frameborder="0" ' +
            'allowfullscreen=true' +
            `>`
        );
    }
  });
}
