class JSONVideosController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env, only: [:search, :create, :update, :destroy]
  authorize_resource only: [:search, :create, :update, :destroy]

  SUPPLEMENTAL_BUCKET = 'cdo-supplemental-curricular-content'.freeze

  # GET /json_videos/search
  def search
    render json: JSONVideosAutocomplete.get_search_matches(params[:query].to_s, params[:limit])
  end

  # POST /json_videos
  #
  # Accepts either an uploaded video JSON `file` (which is pushed to S3 and
  # becomes the video's s3_uri) or an explicit `s3_uri`. When `objective_ids`
  # is present the video is associated with those objectives.
  def create
    video = JSONVideo.new(json_video_params)
    video.s3_uri = upload_content(video.key) if params[:file].present?
    if video.save
      associate_with_jit_pl_object(video)
      set_lesson_objectives(video)
      video.write_serialization
      render json: video.summarize_for_lesson_edit(Lesson.find_by(id: params[:lesson_id]))
    else
      render status: :bad_request, json: video.errors.full_messages.join(', ')
    end
  rescue JSON::ParserError
    render status: :bad_request, json: 'Uploaded file is not valid JSON'
  end

  # PATCH/PUT /json_videos/:id  (:id is the video key)
  def update
    video = JSONVideo.find_by!(key: params[:id])
    attrs = json_video_params
    attrs[:s3_uri] = upload_content(video.key) if params[:file].present?
    if video.update(attrs)
      set_lesson_objectives(video)
      video.write_serialization
      render json: video.summarize_for_lesson_edit(Lesson.find_by(id: params[:lesson_id]))
    else
      render status: :bad_request, json: video.errors.full_messages.join(', ')
    end
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue JSON::ParserError
    render status: :bad_request, json: 'Uploaded file is not valid JSON'
  end

  # DELETE /json_videos/:id  (:id is the video key)
  #
  # Removes the video from a lesson by detaching that lesson's objectives. A
  # video reachable from other lessons survives the detach. Once it is no
  # longer reachable from any objective it is orphaned, and we delete the
  # record, its config file, and its S3 content.
  def destroy
    video = JSONVideo.find_by!(key: params[:id])
    lesson = Lesson.find_by(id: params[:lesson_id])
    video.objectives -= lesson.objectives.to_a if lesson

    if video.objectives.empty?
      delete_content(video)
      File.delete(video.file_path) if Rails.application.config.levelbuilder_mode && File.exist?(video.file_path)
      video.destroy!
      render json: {deleted: true}
    else
      video.write_serialization
      render json: video.summarize_for_lesson_edit(lesson).merge(deleted: false)
    end
  rescue ActiveRecord::RecordNotFound
    head :not_found
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

  # Uploads the posted file to the supplemental-content bucket under a
  # key-derived path and returns its s3:// URI. Validates the file parses as
  # JSON first so we never persist garbage. Raises JSON::ParserError otherwise.
  private def upload_content(key)
    body = params[:file].read
    JSON.parse(body)
    s3_key = "json-videos/#{key}.json"
    AWS::S3.upload_to_bucket(
      SUPPLEMENTAL_BUCKET,
      s3_key,
      body,
      no_random: true,
      content_type: 'application/json'
    )
    "s3://#{SUPPLEMENTAL_BUCKET}/#{s3_key}"
  end

  private def delete_content(video)
    bucket, key = parse_s3_uri(video.s3_uri)
    AWS::S3.delete_from_bucket(bucket, key)
  rescue => exception
    CDO.log.error "Failed to delete json video #{video.key} from S3: #{exception.message}"
  end

  # Replaces the video's objectives within a single lesson while preserving any
  # associations it has through other lessons. `objective_ids` are expected to
  # belong to `lesson_id`; the merge is defensive regardless.
  private def set_lesson_objectives(video)
    return unless params.key?(:objective_ids)
    # The client sends an empty-string marker so an otherwise-empty selection
    # still reaches the server (Rails drops empty array params); drop it here.
    chosen = Objective.where(id: Array(params[:objective_ids]).reject(&:blank?))
    lesson = Lesson.find_by(id: params[:lesson_id])
    video.objectives =
      if lesson
        (video.objectives.where.not(lesson_id: lesson.id).to_a + chosen.to_a).uniq
      else
        chosen.to_a
      end
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
