class CensusController < ApplicationController
  def embeddable_census_map
    view_options(no_header: true, no_footer: true, full_width: true, no_padding_container: true)
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    response.headers['Content-Security-Policy'] = "frame-ancestors *;"
  end
end
