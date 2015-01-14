require 'image_lib'

class LevelSourcesController < ApplicationController
  before_filter :authenticate_user!, only: [:update]
  load_and_authorize_resource
  check_authorization
  skip_authorize_resource only: [:edit, :generate_image, :original_image] # edit is more like show

  before_action :set_level_source

  def show
    @hide_source = true
    if params[:embed]
      @embed = true
      @share = false
      @no_padding = true
      @skip_instructions_popup = true
    end
  end

  def edit
    authorize! :read, @level_source
    @hide_source = false
    # currently edit is the same as show...
    render "show"
  end

  def update
    if @level_source.update(level_source_params)
      if level_source_params[:hidden]
        # delete all gallery activities
        @level_source.level_id
        GalleryActivity.
          joins('inner join activities on activities.id = gallery_activities.activity_id').
          where('activities.level_id' => @level_source.level_id).each do |gallery_activity|
          GalleryActivity.destroy(gallery_activity.id) # the query with joins gives me read only records...
        end
      end

      redirect_to @level_source, notice: I18n.t('crud.updated', LevelSource.model_name.human)
    else
      redirect_to @level_source, notice: "Error: #{level_source.errors.messages}"
    end
  end

  def generate_image
    authorize! :read, @level_source

    expires_in 10.hours, :public => true # cache
    if @game.app == Game::ARTIST then
      framed_image(@level.skin)
    else
      original_image
    end
  end

  def framed_image(skin)
    if @level_source.level_source_image.image == 'S3' ||
        @level_source.level_source_image.save_to_s3(@level_source.level_source_image.image)
      redirect_to @level_source.level_source_image.s3_framed_url
      return
    end

    # image is in the DB
    # TODO: save this in s3, delete from db, redirect there
    if skin == 'anna' || skin == 'elsa'
      image_filename = "app/assets/images/blank_sharing_drawing_#{skin}.png"
    else
      image_filename = "app/assets/images/blank_sharing_drawing.png"
    end

    drawing_on_background = ImageLib::overlay_image(:background_url => Rails.root.join(image_filename),
                                                    :foreground_blob => @level_source.level_source_image.image)
    send_data drawing_on_background.to_blob, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end
  protected :framed_image

  def original_image
    authorize! :read, @level_source

    expires_in 10.hours, :public => true # cache

    if @level_source.level_source_image.image == 'S3' ||
        @level_source.level_source_image.save_to_s3(@level_source.level_source_image.image)
      # image is in s3
      redirect_to @level_source.level_source_image.s3_url
      return
    end

    # image is in the DB
    # TODO: save this in s3, delete from db, redirect there
    send_data @level_source.level_source_image.image, :stream => 'false', :type => 'image/png', :disposition => 'inline'
  end

  protected

  def set_level_source
    if current_user && current_user.admin?
      @level_source = LevelSource.find(params[:id])
    else
      @level_source = LevelSource.where(hidden: false).find(params[:id])
    end
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

  # Never trust parameters from the scary internet, only allow the white list through.
  def level_source_params
    params.require(:level_source).permit(:hidden)
  end

end
