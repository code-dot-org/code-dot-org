class IncubatorController < ApplicationController
  def index
    view_options(full_width: true, no_padding_container: true, responsive_content: true)
  end
end
