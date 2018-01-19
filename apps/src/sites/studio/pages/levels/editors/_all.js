/* global levelbuilder */
import $ from 'jquery';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-editorall]');
  const config = JSON.parse(script.dataset.editorall);

  levelbuilder.jsonEditor("#callout_editor", {
    json_textarea: '#level_callout_json',
    add_button: '#add_callout',
    remove_button: ".remove_callout",
    value_space: ".callout_space",
    template: ".json_template",
    form_container: "#all_callouts_editor",
    wrapper: ".json_editor",
    model: {
      localization_key: "",
      callout_text: "",
      element_id: "",
      on: "",
      qtip_config: {
        codeStudio: {
          canReappear: false,
          dropletPaletteCategory: ""
        },
        style: {classes: ""},
        position: {
          my: "",
          at: "",
          adjust: {x: 0, y: 0}
        }
      }
    }
  });

  function make_selection_handler(flag) {
    return function (e) {
      e.preventDefault();
      $(this).parent().siblings('select').children('option')[flag ? 'attr' : 'removeAttr']('selected', true);
    };
  }

  $('.select_all').click(make_selection_handler(true));
  $('.select_none').click(make_selection_handler(false));

  // This click handler enables adding multiple text inputs for reference links.
  $("#plusAnswerReference").on("click", () => {
    $("#plusAnswerReference").prev().clone().insertBefore("#plusAnswerReference");
  });

  var videoInfos = config.video_infos;

  function updateVideoPreview() {
    var selectionValue = $('.video-dropdown')[0].value;
    if (selectionValue) {
      var videoInfo = videoInfos[selectionValue];
      $('.video-preview').html(window.dashboard.videos.createVideoWithFallback(null, videoInfo, 400, 400));
      $('.video-preview').show();
    } else {
      $('.video-preview').hide();
    }
  }
  $('.video-dropdown').change(updateVideoPreview);
  updateVideoPreview();
}
