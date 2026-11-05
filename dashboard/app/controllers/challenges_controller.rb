class ChallengesController < ApplicationController
  before_action :authenticate_user!
  before_action {head :forbidden unless current_user.can_use_lesson_deep_dive?}
  load_and_authorize_resource only: [:index, :show, :starter_image]
  before_action :require_levelbuilder_mode_or_test_env, only: [:create, :update, :destroy]
  authorize_resource only: [:create, :update, :destroy]

  # key, lesson and the image key are assigned by the server.
  EDITABLE_FIELDS = %w[question default_modality rubric whiteboard_starter_image_alt_text].freeze

  MAX_STARTER_IMAGE_BYTES = 2.megabytes

  class RequestError < StandardError
    attr_reader :status

    def initialize(message, status: :bad_request)
      super(message)
      @status = status
    end
  end

  rescue_from RequestError do |exception|
    render status: exception.status, json: exception.message
  end

  # GET /challenges?lesson_id=:lesson_id
  def index
    challenges = params[:lesson_id].present? ?
      @challenges.where(lesson_id: params[:lesson_id]) :
      @challenges
    render json: challenges&.map(&:summarize)
  end

  # GET /challenges/:id
  def show
    render json: @challenge&.summarize
  end

  # GET /challenges/:id/starter_image
  # Streams the whiteboard starter image bytes same-origin, so the client can
  # place it on the canvas and capture it in the submission snapshot without a
  # cross-origin taint. Starter images are always PNG.
  def starter_image
    return head :not_found if @challenge.whiteboard_starter_image_key.blank?
    send_data @challenge.download_starter_image, type: 'image/png', disposition: 'inline'
  rescue AWS::S3::NoSuchKey
    head :not_found
  end

  # POST /challenges
  # Multipart: lesson_id, challenge_json and an optional starter_image PNG.
  def create
    lesson = Lesson.find(params[:lesson_id])
    challenge = Challenge.new(lesson: lesson, key: generate_key(lesson))
    save_from_request(challenge)
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # PATCH/PUT /challenges/:id
  # Same fields as create, plus remove_starter_image=1.
  def update
    challenge = Challenge.find(params[:id])
    save_from_request(challenge, remove_image: params[:remove_starter_image] == '1')
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # DELETE /challenges/:id
  # Keeps the image object: other environments reference it until they reseed.
  def destroy
    challenge = Challenge.find(params[:id])
    if challenge.challenge_responses.exists?
      return render status: :conflict, json: 'This challenge has student responses and cannot be deleted.'
    end
    File.delete(challenge.file_path) if Rails.application.config.levelbuilder_mode && File.exist?(challenge.file_path)
    challenge.destroy!
    render json: {deleted: true}
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # Validates before uploading so a rejected challenge leaves no S3 object.
  private def save_from_request(challenge, remove_image: false)
    challenge.assign_attributes(challenge_attributes)
    if remove_image
      challenge.whiteboard_starter_image_key = nil
      challenge.whiteboard_starter_image_alt_text = nil
    end
    image = starter_image_bytes
    # New key per upload; other environments may still reference the old object.
    challenge.whiteboard_starter_image_key = "#{challenge.key}-#{SecureRandom.hex(4)}" if image
    unless challenge.valid?
      return render status: :bad_request, json: challenge.errors.full_messages.join(', ')
    end
    challenge.upload_starter_image(image) if image
    challenge.save!
    challenge.write_serialization
    render json: challenge.summarize_for_lesson_edit
  end

  private def challenge_attributes
    attrs = JSON.parse(params[:challenge_json].to_s)
    raise RequestError.new('challenge_json must be a JSON object') unless attrs.is_a?(Hash)
    unknown = attrs.keys - EDITABLE_FIELDS
    raise RequestError.new("Unknown fields: #{unknown.join(', ')}") if unknown.any?
    unless attrs['default_modality'].nil? || Challenge.default_modalities.key?(attrs['default_modality'])
      raise RequestError.new("default_modality must be one of: #{Challenge.default_modalities.keys.join(', ')}")
    end
    # The JSON is the whole editable state: an omitted field is cleared.
    EDITABLE_FIELDS.index_with(nil).merge(attrs)
  rescue JSON::ParserError => exception
    raise RequestError.new("challenge_json is not valid JSON: #{exception.message}")
  end

  private def starter_image_bytes
    file = params[:starter_image]
    return nil if file.blank?
    raise RequestError.new('Starter image must be no larger than 2MB', status: :payload_too_large) if file.size > MAX_STARTER_IMAGE_BYTES
    raise RequestError.new('Starter image must be a PNG', status: :unsupported_media_type) unless file.content_type == 'image/png'
    file.read
  end

  private def generate_key(lesson)
    "challenge-lesson-#{lesson.id}-#{SecureRandom.hex(6)}"
  end
end
