class CensusController < ApplicationController
  def embeddable_census_map
    view_options(no_header: true, no_footer: true, white_background: true, full_width: true)
  end
end
