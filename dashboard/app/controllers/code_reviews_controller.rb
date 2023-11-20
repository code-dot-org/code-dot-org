class CodeReviewsController < ApplicationController
  before_action :authenticate_user!

  # Make sure we don't forget to authorize each action
  check_authorization except: [:peers_with_open_reviews]

  # GET /code_reviews
  # Returns the list of code reviews and associated comments for the given
  # project (identified by channel id).
  def index
    params.require([:channelId])

    project = Project.find_by_channel_id(params[:channelId])

    # Check that current_user can see code reviews associated with this project.
    # (Note that this ability is defined on Project.)
    authorize! :index_code_reviews, project

    # Setting custom header here allows us to access the csrf-token and manually use for create
    headers['csrf-token'] = form_authenticity_token

    code_reviews = CodeReview.includes(:owner, comments: :commenter).where(project_id: project.id)
    render json: code_reviews.map(&:summarize_with_comments)
  end

  # POST /code_reviews
  def create
    params.require([:channelId, :version, :scriptId, :levelId, :projectLevelId])

    project = Project.find_by_channel_id(params[:channelId])
    # TODO: Should we check that this is a valid version for this project?
    # TODO: Can we determine and store an accurate expiration date? Can the expiration date change?

    code_review = CodeReview.new(
      user_id: current_user.id,
      project_id: project.id,
      script_id: params[:scriptId],
      level_id: params[:levelId],
      project_level_id: params[:projectLevelId],
      project_version: params[:version],
      storage_id: project.storage_id
    )
    authorize! :create, code_review, project
    code_review.save!

    render json: code_review.summarize_with_comments
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

    render json: code_review.summarize_with_comments
  end

  # GET /code_reviews/peers_with_open_reviews
  # Returns the list of open code reviews for the given script and project level
  # from peers in the user's code review groups.
  def peers_with_open_reviews
    params.require([:scriptId, :projectLevelId])

    code_reviews = CodeReview.open_reviews.where(
      user_id: peer_user_ids(current_user),
      script_id: params[:scriptId],
      project_level_id: params[:projectLevelId]
    ).includes(:owner)

    return render json: code_reviews.map(&:summarize_owner_info)
  end

  # Returns the user ids of the students that are in the same code review group
  # as the given user. A user id may appear multiple times if a student is in
  # multiple code review groups with the given user.
  def peer_user_ids(student)
    # Get the Follower objects for the current user that are in sections where
    # code review is enabled. There is at most one per section that the student
    # is in and usually just zero or one since the student is unlikely to be in
    # more than one section that has code review enabled.
    followeds = student.
      followeds.
      includes(:section).
      select {|followed| followed.section.code_review_enabled?}

    # For each Follower object, get the user_ids of the other members in the
    # code review group; combine the results and return as a single array.
    followeds.
      filter_map {|followed| followed.code_review_group&.followers&.pluck(:student_user_id)}.
      flatten.
      select {|user_id| user_id != student.id}
  end
end
