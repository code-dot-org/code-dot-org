class ChallengeResponsesController < ApplicationController
  before_action :authenticate_user!
  # `create` builds the response and its nested assets by hand, so skip
  # CanCanCan's automatic resource loading for it (it would otherwise try to
  # build ChallengeResponse from `challenge_response_params`, which includes the
  # non-attribute `assets` key) and authorize the class directly instead.
  load_and_authorize_resource except: :create
  before_action :authorize_create!, only: :create

  # POST /challenge_responses
  #
  # Atomically creates a response and one asset row per requested asset_type,
  # then returns presigned S3 upload URLs the client PUTs the asset bytes to.
  def create
    permitted = challenge_response_params
    asset_params = permitted.delete(:assets) || []
    @challenge_response = ChallengeResponse.new(permitted.merge(user_id: current_user.id))
    asset_params.each do |asset|
      @challenge_response.challenge_response_assets.build(asset_type: asset[:asset_type])
    end
    @challenge_response.save!
    render json: @challenge_response.summarize(assets_for_upload: true), status: :created
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # GET /challenge_responses/:id
  def show
    render json: @challenge_response.summarize
  end

  private def authorize_create!
    authorize! :create, ChallengeResponse
  end

  # Server-owned fields (transcript, student_feedback, evaluation_result,
  # evaluated_at) are intentionally not permitted.
  private def challenge_response_params
    params.permit(:challenge_id, :student_text, :is_final, assets: [:asset_type])
  end
end
