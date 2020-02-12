class VideosController < ApplicationController
  before_action :authenticate_user!, except: [:test, :embed]
  before_action :require_levelbuilder_mode, except: [:test, :embed, :index]
  check_authorization except: [:test, :embed]
  load_and_authorize_resource except: [:test, :embed]
  after_action :allow_iframe, only: :embed

  before_action :set_video, only: [:edit, :update]

  # This page is currently deprecated, so let's redirect to related content.
  def test
    redirect_to CDO.code_org_url('/educate/it')
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
    video_info = @video.summarize(params.key?(:autoplay))
    video_info[:enable_fallback] = !params.key?(:youtube_only)
    video_info[:force_fallback] = params.key?(:fallback_only)
    render layout: false, locals: {video_info: video_info}
  end

  def index
    @videos = Video.all
  end

  def new
    @video = Video.new
  end

  def edit
    @s3_metadata = Video.s3_metadata(@video.download)
  end

  def create
    filename = upload_to_s3
    @video = Video.new(video_params.merge(download: "https://videos.code.org/#{filename}"))

    if @video.locale != I18n.default_locale.to_s
      unless Video.exists?(key: @video.key, locale: I18n.default_locale.to_s)
        raise 'Non-English videos must be associated with an English video of the same key'
      end
    end

    if @video.save
      merge_and_write

      redirect_to videos_path, notice: I18n.t('crud.created', model: Video.model_name.human)
    else
      render action: 'new'
    end
  end

  # PATCH/PUT /videos/1
  # PATCH/PUT /videos/1.json
  def update
    filename = upload_to_s3

    if @video.update(video_params.merge(download: "https://videos.code.org/#{filename}"))
      merge_and_write

      redirect_to videos_path, notice: I18n.t('crud.updated', model: Video.model_name.human)
    else
      render action: 'edit'
    end
  end

  private

  def upload_to_s3
    raise 'Expected a video/mp4 (.mp4) file' unless video_params[:download].content_type == 'video/mp4'

    filename = File.basename(video_params[:download].original_filename).parameterize + '.mp4'
    AWS::S3.upload_to_bucket(
      'videos.code.org',
      "levelbuilder/#{filename}",
      video_params[:download],
      acl: 'public-read',
      no_random: true,
    )
  end

  def allow_iframe
    response.headers['X-Frame-Options'] = 'ALLOWALL'
  end

  # Use callbacks to share common setup or constraints between actions.
  def set_video
    @video = Video.current_locale.find(params[:id])
  end

  def set_video_by_key
    key = params[:key]
    # Create a temporary video object from default attributes if an entry isn't found in the DB.
    @video = Video.current_locale.find_by_key(key) ||
      Video.new(
        key: key,
        youtube_code: key,
        download: Video.download_url(key)
      )
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def video_params
    params.require(:video).permit(:key, :youtube_code, :download, :locale)
  end

  def i18n_params
    params.permit(:title)
  end

  # This is to fix a ForbiddenAttributesError CanCan issue.
  prepend_before_action do
    params[:video] &&= video_params
  end

  def merge_and_write
    if @video.locale == I18n.default_locale.to_s
      Video.merge_and_write_i18n({@video.key => i18n_params[:title]})
    end
    Video.merge_and_write_attributes(@video.key, @video.youtube_code, @video.download, @video.locale)
  end
end
