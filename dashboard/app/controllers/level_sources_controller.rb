require 'base64'
require 'image_lib'

class LevelSourcesController < ApplicationController
  include LevelsHelper
  before_action :authenticate_user!, only: [:update]
  load_and_authorize_resource
  check_authorization
  skip_authorize_resource only: [:edit, :generate_image, :original_image] # edit is more like show

  before_action :set_level_source

  def show
    if params[:embed]
      # embed only the play area (eg. ninjacat)
      level_view_options(
        @level_source.level_id,
        hide_source: true,
        embed: true,
        share: false,
        skip_instructions_popup: true
      )
    elsif params[:hint_embed]
      # embed the play area and code area for viewing solutions when contributing hints
    else
      # sharing
      level_view_options(@level_source.level_id, hide_source: true)
      view_options(no_header: true, no_footer: true, code_studio_logo: true, is_legacy_share: true)
      @legacy_share_style = true
    end

    respond_to do |format|
      format.html
      format.json {render json: {data: @level_source.data}}
    end
  end

  def edit
    authorize! :read, @level_source
    level_view_options(@level_source.level_id, hide_source: false)
    view_options(small_footer: true, is_legacy_share: true)
    @legacy_share_style = true
    # currently edit is the same as show...
    render "show"
  end

  def update
    if @level_source.update(level_source_params)
      redirect_to @level_source, notice: I18n.t('crud.updated', model: LevelSource.model_name.human)
    else
      redirect_to @level_source, notice: "Error: #{level_source.errors.messages}"
    end
  end

  def generate_image
    authorize! :read, @level_source

    expires_in 10.hours, public: true # cache

    if @game.app == Game::ARTIST
      redirect_to @level_source.level_source_image.s3_framed_url
    else
      original_image
    end
  end

  def original_image
    authorize! :read, @level_source

    expires_in 10.hours, public: true # cache

    redirect_to @level_source.level_source_image.s3_url
  end

  protected

  def set_level_source
    reset_abuse_user = current_user && current_user.permission?(UserPermission::PROJECT_VALIDATOR)
    # Depending on the url route, one of params[:level_source_id_and_user_id] (for /r/ links) or
    # params[:id] (for /c/ links) is set. For the former, deobfuscate the level_source_id.
    level_source_id =
      if params[:level_source_id_and_user_id]
        LevelSource.decrypt_level_source_id(
          params[:level_source_id_and_user_id],
          ignore_missing_user: reset_abuse_user
        )
      else
        params[:id]
      end
    raise ActiveRecord::RecordNotFound if level_source_id.nil?
    @level_source =
      if reset_abuse_user
        LevelSource.find(level_source_id)
      else
        LevelSource.where(hidden: false).find(level_source_id)
      end
    @level = Level.cache_find(@level_source.level_id)
    @game = @level.game
    view_options(
      callouts: [],
      full_width: true,
      has_i18n: @game.has_i18n?
    )
    @callback = milestone_level_url(user_id: current_user.try(:id) || 0, level_id: @level.id)
    level_view_options(
      @level.id,
      start_blocks: @level_source.data,
      share: true
    )
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def level_source_params
    params.require(:level_source).permit(:hidden)
  end
end
