class CodeReviewCommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create, :project_comments]

  check_authorization
  load_and_authorize_resource :code_review_comment, only: [:resolve, :destroy]

  # POST /code_review_comments
  def create
    additional_attributes = {
      commenter_id: current_user.id,
      storage_app_id: @storage_app_id,
      project_owner_id: @project_owner.id
    }
    @code_review_comment = CodeReviewComment.new(code_review_comments_params.merge(additional_attributes))

    authorize! :create, @code_review_comment, @project_owner
    if @code_review_comment.save
      return render json: @code_review_comment
    else
      return head :bad_request
    end
  end

  # PATCH /code_review_comments/:id/resolve
  def resolve
    @code_review_comment.inspect
    if @code_review_comment.update(is_resolved: true)
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
    authorize! :project_comments, CodeReviewComment.new, @project_owner

    # To do: get project version passed as param
    @project_comments = CodeReviewComment.where(
      storage_app_id: @storage_app_id
    ).order(created_at: :desc)

    serialized_comments = @project_comments.map do |comment|
      {
        id: comment.id,
        name: comment.commenter&.name,
        commentText: comment.comment,
        timestampString: comment.created_at,
        isResolved: !!comment.is_resolved,
        isFromTeacher: !!comment.is_from_teacher,
        isFromCurrentUser: !!(comment.commenter == current_user),
        isFromOlderVersionOfProject: false
      }
    end

    render json: serialized_comments
  end

  private

  def decrypt_channel_id
    # TO DO: handle errors in decrypting, or can't find user
    puts params
    @storage_id, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
    @project_owner = User.find_by(id: user_id_for_storage_id(@storage_id))
  end

  # # TO DO: modify permit_params to handle other parameters (eg, section ID)
  # def code_review_comments_params
  #   params.permit(
  #     :project_version,
  #     :comment,
  #     :is_resolved
  #   )
  # end
end
