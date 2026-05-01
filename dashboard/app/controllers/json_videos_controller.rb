class JSONVideosController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env, only: [:search, :create]
  authorize_resource only: [:search, :create]

  # GET /json_videos/search
  def search
    render json: JSONVideosAutocomplete.get_search_matches(params[:query].to_s, params[:limit])
  end

  # POST /json_videos
  def create
    video = JSONVideo.new(json_video_params)
    if video.save
      associate_with_jit_pl_object(video)
      render json: video.summarize
    else
      render status: :bad_request, json: video.errors.full_messages.join(', ')
    end
  end

  # GET /json_videos/:id/content
  # Fetches the JSON video file from S3 and returns it directly, keeping S3
  # credentials server-side.
  def content
    video = JSONVideo.find_by!(key: params[:id])
    bucket, key = parse_s3_uri(video.s3_uri)
    body = AWS::S3.download_from_bucket(bucket, key)
    render plain: body, content_type: 'application/json'
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue => exception
    CDO.log.error "Failed to fetch json video #{params[:id]} from S3: #{exception.message}"
    head :bad_gateway
  end

  private def json_video_params
    params.permit(:key, :description, :s3_uri, :json_schema_version, :audience)
  end

  private def associate_with_jit_pl_object(video)
    if (id = params[:jit_pl_exemplar_id])
      JitPlExemplar.find_by(id: id)&.json_videos&.<<(video)
    elsif (id = params[:jit_pl_misconception_id])
      JitPlMisconception.find_by(id: id)&.json_videos&.<<(video)
    elsif (id = params[:jit_pl_concept_id])
      JitPlConcept.find_by(id: id)&.json_videos&.<<(video)
    end
  end

  private def parse_s3_uri(uri)
    # "s3://bucket/path/to/key" → ["bucket", "path/to/key"]
    uri.sub('s3://', '').split('/', 2)
  end
end
