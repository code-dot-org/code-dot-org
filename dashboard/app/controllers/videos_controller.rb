class VideosController < ApplicationController
  before_action :authenticate_user!, except: [:test]
  before_action :require_levelbuilder_mode, except: [:test, :index]
  check_authorization except: [:test]
  load_and_authorize_resource except: [:test]

  before_action :set_video, only: [:edit, :update]

  # This page is currently deprecated, so let's redirect to related content.
  def test
    redirect_to CDO.code_org_url('/educate/it')
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
    return render(status: :not_acceptable, plain: 'Key required') if video_params[:key].blank?
    return render(status: :not_acceptable, plain: 'YouTube code required') if video_params[:youtube_code].blank?
    return render(status: :not_acceptable, plain: 'Download file required') unless video_params[:download]

    filename = upload_to_s3
    @video = Video.new(video_params.merge(download: "https://videos.code.org/#{filename}"))

    if @video.locale != I18n.default_locale.to_s && !Video.exists?(key: @video.key, locale: I18n.default_locale.to_s)
      raise 'Non-English videos must be associated with an English video of the same key'
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
    return render(status: :not_acceptable, plain: 'Key required') if video_params[:key].blank?
    return render(status: :not_acceptable, plain: 'YouTube code required') if video_params[:youtube_code].blank?
    return render(status: :not_acceptable, plain: 'Download file required') unless video_params[:download]

    filename = upload_to_s3

    if @video.update(video_params.merge(download: "https://videos.code.org/#{filename}"))
      merge_and_write

      redirect_to videos_path, notice: I18n.t('crud.updated', model: Video.model_name.human)
    else
      render action: 'edit'
    end
  end

  private def upload_to_s3
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

  # Use callbacks to share common setup or constraints between actions.
  private def set_video
    @video = Video.find(params[:id])
  end

  private def set_video_by_key
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
  private def video_params
    params.require(:video).permit(:key, :youtube_code, :download, :locale)
  end

  private def i18n_params
    params.permit(:title)
  end

  # This is to fix a ForbiddenAttributesError CanCan issue.
  prepend_before_action do
    params[:video] &&= video_params
  end

  private def merge_and_write
    if @video.locale == I18n.default_locale.to_s
      Video.merge_and_write_i18n({@video.key => i18n_params[:title]})
    end
    Video.merge_and_write_attributes(@video.key, @video.youtube_code, @video.download, @video.locale)
  end
end
