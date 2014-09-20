require 'phantomjs'

def generate_screencap(url, file, viewport_width = 1200, viewport_height = 800, zoom = 1, render_time = 10000, time_out = 90000, selector = nil)
  cmd = [
    Phantomjs.path,
    "'" + File.expand_path('../screencap.js', __FILE__) + "'",
    url,
    file,
    viewport_width,
    viewport_height,
    zoom,
    render_time,
    time_out,
    selector
  ].join(" ")

  @result = `#{cmd}`
end
