import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-editorvideo]');
  const config = JSON.parse(script.dataset.editorvideo);

  var videoInfos = config.video_infos;

  function updateVideoPreview() {
    var selectionValue = $('.video-dropdown')[0].value;
    if (selectionValue) {
      var videoInfo = videoInfos[selectionValue];
      $('.video-preview').html(
        window.dashboard.videos.createVideoWithFallback(
          null,
          videoInfo,
          400,
          400
        )
      );
      $('.video-preview').show();
    } else {
      $('.video-preview').hide();
    }
  }
  $('.video-dropdown').change(updateVideoPreview);
  updateVideoPreview();
}
