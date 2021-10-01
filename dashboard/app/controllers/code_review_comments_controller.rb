class CodeReviewCommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create, :project_comments]

  check_authorization
  load_and_authorize_resource :code_review_comment, only: [:toggle_resolved, :destroy]

  # POST /code_review_comments
  def create
    additional_attributes = {
      commenter_id: current_user.id,
      storage_app_id: @storage_app_id,
      project_owner_id: @project_owner.id
    }
    @code_review_comment = CodeReviewComment.new(code_review_comments_params.merge(additional_attributes))

    # We wait to authorize until this point because we need to know
    # who owns the project that the comment is associated with.
    authorize! :create, @code_review_comment, @project_owner, @storage_app_id, params[:level_id], params[:script_id]

    if @code_review_comment.save
      return render json: serialize(@code_review_comment)
    else
      return head :bad_request
    end
  end

  # PATCH /code_review_comments/:id/toggle_resolved
  def toggle_resolved
    if @code_review_comment.update(is_resolved: params[:is_resolved])
      return head :ok
    else
      return head :bad_request
    end
  end

  # DELETE /code_review_comments/:id
  def destroy
    if @code_review_comment.delete
      return head :ok
    else
      return head :bad_request
    end
  end

  # GET /code_review_comments/project_comments
  def project_comments
    authorize! :project_comments, CodeReviewComment.new, @project_owner, @storage_app_id

    # Setting custom header here allows us to access the csrf-token and manually use for create
    headers['csrf-token'] = form_authenticity_token

    @project_comments = CodeReviewComment.where(
      storage_app_id: @storage_app_id
    ).order(:created_at)

    # Keep teacher comments private between project owner and teacher.
    unless @project_owner.student_of?(current_user) || @project_owner == current_user
      @project_comments = @project_comments.reject {|comment| !!comment.is_from_teacher}
    end

    serialized_comments = @project_comments.map {|comment| serialize(comment)}

    render json: serialized_comments
  end

  private

  def decrypt_channel_id
    # TO DO: handle errors in decrypting, or can't find user
    @storage_id, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
    @project_owner = User.find_by(id: user_id_for_storage_id(@storage_id))
  end

  def code_review_comments_params
    params.permit(
      :comment,
      :script_id,
      :level_id,
      :is_resolved
    )
  end

  def serialize(comment)
    # once comments associated with project versions is implemented,
    # we should calculate isFromOlderVersionOfProject there.
    {
      id: comment.id,
      name: comment.commenter&.name,
      commentText: comment.comment,
      projectVersion: comment.project_version,
      timestampString: comment.created_at,
      isResolved: !!comment.is_resolved,
      isFromTeacher: !!comment.is_from_teacher,
      isFromCurrentUser: !!(comment.commenter == current_user),
      isFromProjectOwner: !!(comment.commenter == @project_owner),
      isFromOlderVersionOfProject: false
    }
  end
end
