dashboard.createCallouts = function(callouts) {
  if (!callouts) {
    return;
  }

  // Hide callouts when the function editor is closed (otherwise they jump to the top left corner)
  $(window).on('function_editor_closed', function() {
    $('.cdo-qtips').qtip('hide');
  });

  function reverseCallout(position) {
    position = position.split(/\s+/);
    return reverseDirection(position[0]) + ' ' + reverseDirection(position[1]);
  }

  function reverseDirection(token) {
    switch (token) {
      case 'left': return 'right';
      case 'right': return 'left';
      default: return token;
    }
  }

  $.fn.qtip.zindex = 500;
  callouts.forEach(function(callout) {
    var selector = callout.element_id; // jquery selector.
    if ($(selector).length === 0 && !callout.on) {
      return;
    }

    var defaultConfig = {
      content: {
        text: callout.localized_text,
        title: {
          button: $('<div class="tooltip-x-close"/>')
        }
      },
      style: {
        classes: "",
        tip: {
          width: 20,
          height: 20
        }
      },
      position: {
        my: "bottom left",
        at: "top right"
      },
      hide: {
        event: 'click mousedown touchstart'
      },
      show: false // don't show on mouseover
    };

    var customConfig = $.parseJSON(callout.qtip_config);
    var config = $.extend(true, {}, defaultConfig, customConfig);
    config.style.classes = config.style.classes.concat(" cdo-qtips");

    // Reverse callouts in RTL mode
    if ($('html[dir=rtl]').length) {
      config.position.my = reverseCallout(config.position.my);
      config.position.at = reverseCallout(config.position.at);
      if (config.position.adjust) {
        config.position.adjust.x *= -1;
      }
    }

    // Flip the close button if it would overlap the qtip
    if (config.position.my === 'top right' || config.position.my === 'right top') {
      config.style.classes += ' flip-x-close';
    }

    if (callout.on) {
      $(window).on(callout.on, function() {
        if (!callout.seen && $(selector).length > 0) {
          callout.seen = true;
          $(selector).qtip(config).qtip('show');
        }
      });
    } else {
      $(selector).qtip(config).qtip('show');
    }
  });
};
