class CodeReviewsController < ApplicationController
  before_action :authenticate_user!

  # Make sure we don't forget to authorize each action
  check_authorization

  # GET /code_reviews
  # Returns the list of code reviews and associated comments for the given
  # project (identified by channel id), script, and level.
  def index
    params.require([:channelId, :scriptId, :levelId])

    storage_id, project_id = storage_decrypt_channel_id(params[:channelId])
    project_owner_id = user_id_for_storage_id(storage_id)
    project_owner = User.find(project_owner_id)

    # Check that current_user can see code reviews associated with this project
    authorize! :read, CodeReview, project_owner

    code_reviews = CodeReview.get_all(
      project_id: project_id,
      script_id: params[:scriptId],
      level_id: params[:levelId]
    )

    render json: code_reviews.map(&:summarize_with_comments)
  end

  # POST /code_reviews
  def create
    params.require([:scriptId, :levelId, :channelId, :version])

    storage_id, project_id = storage_decrypt_channel_id(params[:channelId])
    project_owner_id = user_id_for_storage_id(storage_id)
    # TODO: Should we check that this is a valid version for this project?
    # TODO: Can we determine and store an accurate expiration date? Can the expiration date change?

    # TODO: Consider storing the channel_id instead of the project_id in CodeReview
    code_review = CodeReview.new(
      user_id: current_user.id,
      script_id: params[:scriptId],
      level_id: params[:levelId],
      project_id: project_id,
      project_version: params[:version]
    )
    authorize! :create, code_review, project_owner_id
    code_review.save!

    render json: code_review.summarize
  end

  # PATCH /code_reviews/:id
  # Currently, closing the code review is the only allowed update.
  def update
    params.require(:id)

    code_review = CodeReview.find(params[:id])
    authorize! :edit, code_review

    if params[:isClosed]
      return head :bad_request unless params[:isClosed] == 'true'
      if code_review.open?
        code_review.close
        code_review.save!
      end
    end

    render json: code_review.summarize
  end
end
