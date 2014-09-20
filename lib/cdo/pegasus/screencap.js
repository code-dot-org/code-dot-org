var
  webpage = require('webpage'),
  fs      = require('fs'),
  system  = require('system'),

  viewport_width  = system.args[3] || 1200,
  viewport_height = system.args[4] || 800,
  zoom            = system.args[5] || 1,
  render_time     = system.args[6] || 10000,
  time_out        = system.args[7] || 90000,
  selector        = system.args[8] || '';

function error(msg) {
  msg = msg || 'Unknown error';
  console.log(msg);
  phantom.exit(1);
  throw msg;
}

function print_usage() {
  console.log('Usage: screencap.js url filename [viewport_width] [viewport_height] [zoom] [render_time] [time_out] [selector]');
}

window.setTimeout(function () {
  error("Things being weird no result within: " + time_out + "ms");
}, time_out);

function renderUrl(url, output, options) {
  options = options || {};

  var statusCode,
    page = webpage.create();

  for (var k in options) {
    if (options.hasOwnProperty(k)) {
      page[k] = options[k];
    }
  }

  // Determine the statusCode.
  page.onResourceReceived = function (resource) {
    if (resource.url == url) {
      statusCode = resource.status;
    }
  };

  page.onResourceError = function (resourceError) {
    error(resourceError.errorString + ' (URL: ' + resourceError.url + ')');
  };

  page.onNavigationRequested = function (redirect_url, type, willNavigate, main) {
    if (main) {
      if (redirect_url !== url) {
        page.close();
        renderUrl(redirect_url, output, options);
      }
    }
  };

  page.open(url, function (status) {
    if (status !== 'success' || (statusCode != 200 && statusCode != null)) {
      if (fs.exists(output)) {
        fs.remove(output);
      }
      try {
        fs.touch(output);
      } catch (e) {
        console.log(e);
      }

      error('Unable to load the URL: ' + url + ' (HTTP ' + statusCode + ')');
    } else {
      var temp_output = output + '_tmp.' + output.split('.').pop();

      window.setTimeout(function () {
        if (selector) {
          var clipRect = page.evaluate(function(selector) {
            return document.querySelector(selector).getBoundingClientRect();
          }, selector);

          page.clipRect = {
            top:    clipRect.top,
            left:   clipRect.left,
            width:  clipRect.width,
            height: clipRect.height
          };
        }

        page.render(temp_output);

        if (fs.exists(output)) {
          fs.remove(output);
        }

        try {
          fs.move(temp_output, output);
        } catch (e) {
          error(e);
        }
        console.log('Rendered to: ' + output, new Date().getTime());
        phantom.exit(0);
      }, render_time);
    }
  });
}

if (system.args.length < 3 || system.args.length > 13) {
  print_usage() && phantom.exit(2);
} else {
  address = system.args[1];
  output  = system.args[2];

  page_options = {
    viewportSize: {
      width:  viewport_width,
      height: viewport_height
    },
    zoomFactor: zoom
  };

  renderUrl(address, output, page_options);
}
