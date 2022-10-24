class MusiclabController < ApplicationController
  def index
    view_options(no_footer: true)
    @body_classes = "music-black"
  end
end
