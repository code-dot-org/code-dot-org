require 'image_lib'

class LevelSourcesController < ApplicationController
  before_filter :load_level_source

  def show
    @hide_source = true
  end

  def edit
    @hide_source = false
    # currently edit is the same as show...
    render "show"
  end

  def generate_image
    if @game.app == Game::ARTIST && ! ['anna', 'elsa'].include?(@level.skin) then
      framed_image
    else
      original_image
    end
  end

  def framed_image
    drawing_on_background = ImageLib::overlay_image(:background_url => Rails.root.join('app/assets/images/blank_sharing_drawing.png'),
                                                    :foreground_blob => @level_source.level_source_image.image)
    send_data drawing_on_background.to_blob, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end
  
  def original_image
    send_data @level_source.level_source_image.image, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end

  protected
  def load_level_source
    @level_source_id = params[:id]
    @level_source = LevelSource.find(@level_source_id)
    @phone_share_url = send_to_phone_url
    @start_blocks = @level_source.data
    @level = @level_source.level
    @game = @level.game
    @full_width = true
    @share = true
    @callback = milestone_level_url(user_id: current_user.try(:id) || 0, level_id: @level.id)
    @no_padding = @share && browser.mobile? && @game.share_mobile_fullscreen?
    @callouts = []
  end
end
