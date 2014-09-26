require 'image_lib'

class LevelSourcesController < ApplicationController
  include LevelsHelper

  def show
    common(true)
  end

  def edit
    common(false)
    # currently edit is the same as show...
    render "show"
  end

  def generate_image
    framed_image
  end

  def framed_image
    background_url = 'app/assets/images/blank_sharing_drawing.png'
    level_source_id = LevelSource.find(params[:id]).id
    drawing_blob = LevelSourceImage.find_by_level_source_id(level_source_id).image
    drawing_on_background = ImageLib::overlay_image(:background_url => background_url, :foreground_blob => drawing_blob)
    send_data drawing_on_background.to_blob, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end
  
  def original_image
    send_data LevelSourceImage.find_by_level_source_id(params[:id]).image, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end

  protected
  def common(hide_source)
    @level_source_id = params[:id]
    @level_source = LevelSource.find(@level_source_id)
    @start_blocks = @level_source.data
    @level = @level_source.level
    @game = @level.game
    @full_width = true
    @hide_source = hide_source
    @share = true
    @callback = milestone_level_url(user_id: current_user.try(:id) || 0, level_id: @level.id)
    @no_padding = @share && browser.mobile? && @game.share_mobile_fullscreen?
    @callouts = []
  end
end
