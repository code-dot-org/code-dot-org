class CodeReviewsController < ApplicationController
  before_action :authenticate_user!

  # Make sure we don't forget to authorize each action
  check_authorization

  # GET /code_reviews
  # Returns the list of code reviews and associated comments for the given
  # project (identified by channel id).
  def index
    params.require([:channelId])

    project = Project.find_by_channel_id(params[:channelId])

    # Check that current_user can see code reviews associated with this project.
    # (Note that this ability is defined on Project.)
    authorize! :index_code_reviews, project

    code_reviews = CodeReview.where(project_id: project.id)
    render json: code_reviews.map(&:summarize_with_comments)
  end

  # POST /code_reviews
  def create
    params.require([:channelId, :version, :scriptId, :levelId])

    project = Project.find_by_channel_id(params[:channelId])
    # TODO: Should we check that this is a valid version for this project?
    # TODO: Can we determine and store an accurate expiration date? Can the expiration date change?

    code_review = CodeReview.new(
      user_id: current_user.id,
      project_id: project.id,
      project_version: params[:version],
      script_id: params[:scriptId],
      level_id: params[:levelId]
    )
    authorize! :create, code_review, project
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
