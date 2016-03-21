class VideosController < ApplicationController
  before_filter :authenticate_user!, except: [:test, :embed]
  check_authorization except: [:test, :embed]
  load_and_authorize_resource except: [:test, :embed]
  after_action :allow_iframe, only: :embed

  before_action :set_video, only: [:show, :edit, :update, :destroy]

  def test
    @video = Video.first
  end

  def embed
    set_video_by_key
    if current_user.try(:admin?) && !Rails.env.production? && !Rails.env.test?
      params[:fallback_only] = true
      begin
        require 'cdo/video/youtube'
        Youtube.process @video.key
      rescue Exception => e
        render(layout: false, text: "Error processing video: #{e}. Contact an engineer for support.", status: 500) && return
      end
    end
    video_info = @video.summarize(params.has_key?(:autoplay))
    video_info[:enable_fallback] = !params.has_key?(:youtube_only)
    video_info[:force_fallback] = params.has_key?(:fallback_only)
    render layout: false, locals: {video_info: video_info}
  end

  def index
    @videos = Video.all
  end

  def show
  end

  def new
    @video = Video.new
  end

  def edit
  end

  def create
    @video = Video.new(video_params)

    respond_to do |format|
      if @video.save
        format.html { redirect_to @video, notice: I18n.t('crud.created', Video.model_name.human) }
        format.json { render action: 'show', status: :created, location: @video }
      else
        format.html { render action: 'new' }
        format.json { render json: @video.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /videos/1
  # PATCH/PUT /videos/1.json
  def update
    respond_to do |format|
      if @video.update(video_params)
        format.html { redirect_to @video, notice: I18n.t('crud.updated', model: Video.model_name.human) }
        format.json { head :no_content }
      else
        format.html { render action: 'edit' }
        format.json { render json: @video.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /videos/1
  # DELETE /videos/1.json
  def destroy
    @video.destroy
    respond_to do |format|
      format.html { redirect_to videos_url }
      format.json { head :no_content }
    end
  end

  private

  def allow_iframe
    response.headers['X-Frame-Options'] = 'ALLOWALL'
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_video
    @video = Video.find(params[:id])
  end

  def set_video_by_key
    key = params[:key]
    # Create a temporary video object from default attributes if an entry isn't found in the DB.
    @video = Video.find_by_key(key) ||
      Video.new(
        key: key,
        youtube_code: key,
        download: Video.download_url(key)
      )
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def video_params
    params.require(:video).permit(:name, :key, :youtube_code)
  end

  # This is to fix a ForbiddenAttributesError CanCan issue.
  prepend_before_filter do
    params[:video] &&= video_params
  end
end
