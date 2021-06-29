class CodeReviewCommentsController < ApplicationController
  before_action :decrypt_channel_id

  check_authorization # if we want to keep this, put authorization on each action
  load_and_authorize_resource
  # TO DO: More nuanced permissioning. Sketched permissions below:
  # create:
  #   students (in same section as project owner?) and
  #   teachers (only teacher leading section?) can create comments
  # update (ie, change comment):
  #   comment creator
  #   teacher (only teacher leading section?)
  # resolve:
  #   owner of project (independent of account type) can update comments to resolved
  # destroy:
  #   comment creator
  #   teacher (leading section?) can delete their own comments (or comments of their students)
  # project_comments (get comments for a project):
  #   project owner
  #   teacher (leading section?)
  #   any other student in section?

  # POST /code_review_comments
  def create
    # conditions for being able to create a comment on a project:
    return unless @project_owner == current_user ||
      @project_owner.student_of?(current_user) ||
      current_user.sections.intersection(@project_owner.sections)

    @code_review_comment = CodeReviewComment.new(code_review_comments_params)

    authorize! :create, @code_review_comment

    if @code_review_comment.save
      render json: @code_review_comment
    else
      head :bad_request
    end
  end

  # TBD: will we update existing comments when someone wants to edit a comment,
  # or just create a new comment?
  # PATCH /code_review_comments/:id
  def update
    return unless current_user == @code_review_comment.commenter ||
      @project_owner.student_of?(current_user)

    if @code_review_comment.update(code_review_comments_params)
      head :ok
    else
      head :bad_request
    end
  end

  # PATCH /code_review_comments/:id/resolve
  def resolve
    return unless current_user == @project_owner

    if @code_review_comment.update(is_resolved: true)
      head :ok
    else
      head :bad_request
    end
  end

  # DELETE /code_review_comments/:id
  def destroy
    return unless current_user == @code_review_comment.commenter ||
      @project_owner.student_of?(current_user)

    if @code_review_comment.delete
      head :ok
    else
      head :bad_request
    end
  end

  # require project id, project version
  # GET /code_review_comments/project_comments
  def project_comments
    # conditions for being able to create a comment on a project:
    return unless @project_owner == current_user ||
      @project_owner.student_of?(current_user) ||
      current_user.sections.intersection(@project_owner.sections)

    @project_comments = CodeReviewComment.where(
      storage_app_id: params[:storage_app_id],
      project_version: params[:project_version]
    )

    render json: @project_comments
  end

  private

  def decrypt_channel_id
    @storage_id, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
    @project_owner = User.find(user_id_for_storage_id(storage_id))
  end

  # TO DO: modify permit_params to handle other parameters (eg, section ID)
  def code_review_comments_params
    params.permit(
      :storage_app_id,
      :project_version,
      :commenter_id,
      :comment,
      :is_resolved
    )
  end
end
