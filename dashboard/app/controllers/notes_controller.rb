class NotesController < ApplicationController
  include NotesHelper

  def index
    @slides = get_slides_by_video_key(params[:key])

    unless @slides
      head(:not_found) && return
    end

    render layout: false, formats: [:html]
  end
end
