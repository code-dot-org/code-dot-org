class MusiclabController < ApplicationController
  def index
    view_options(no_footer: true, full_width: true)
    @body_classes = "music-black"
  end
end
