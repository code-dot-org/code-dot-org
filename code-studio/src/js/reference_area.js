/* globals showVideoDialog */

// It would be nice if we could share this with the addClickTouchEvent in
// apps/src/dom.js
var addClickTouchEvent = function(element, handler) {
  var wrapper = function(e) {
    handler(e);
    e.preventDefault();
  };
  element.on({
    'touchstart': wrapper,
    'click': wrapper
  });
};

module.exports = function activateReferenceAreaOnLoad() {
  $(window).load(function () {
    // Do nothing if we don't  have a reference area
    if ($("#reference_area").length === 0) {
      return;
    }

    $('.video_link').each(function() {
      addClickTouchEvent($(this), $.proxy(function() {
        showVideoDialog({
          src: $(this).attr('data-src'),
          name: $(this).attr('data-name'),
          key: $(this).attr('data-key'),
          download: $(this).attr('data-download'),
          thumbnail: $(this).attr('data-thumbnail'),
          enable_fallback: true,
          autoplay: true
        }, true);
      }, this));
    });
    // Allow levels to specify how and where the reference area is rendered.
    // Reparent the reference area under the target if the target exists.
    $('#reference_area_target').append($('#reference_area'));
    // Show only text links if "data-minimal" is set.
    if ($('#reference_area_target').data('minimal')) {
      $('#reference_area .video_thumbnail').hide();
    }
  });
};
