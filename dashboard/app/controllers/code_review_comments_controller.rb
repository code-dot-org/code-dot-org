class CodeReviewCommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create, :project_comments]

  # TO DO: uncomment once we've moved permissioning into CanCan
  #check_authorization
  load_resource

  # POST /code_review_comments
  def create
    return head :forbidden unless @project_owner == current_user ||
      @project_owner.student_of?(current_user) ||
      (current_user.sections_as_student & @project_owner.sections_as_student).any?

    additional_attributes = {
      commenter_id: current_user.id,
      storage_app_id: @storage_app_id
    }
    @code_review_comment = CodeReviewComment.new(code_review_comments_params.merge(additional_attributes))

    if @code_review_comment.save
      return render json: @code_review_comment
    else
      return head :bad_request
    end
  end

  # PATCH /code_review_comments/:id/resolve
  def resolve
    return head :forbidden unless current_user == @code_review_comment.project_owner

    @code_review_comment.inspect
    if @code_review_comment.update(is_resolved: true)
      return head :ok
    else
      return head :bad_request
    end
  end

  # DELETE /code_review_comments/:id
  def destroy
    return head :forbidden unless @code_review_comment.project_owner.student_of?(current_user)

    if @code_review_comment.delete
      return head :ok
    else
      return head :bad_request
    end
  end

  # GET /code_review_comments/project_comments
  def project_comments
    return head :forbidden unless @project_owner == current_user ||
      @project_owner.student_of?(current_user) ||
      (current_user.sections_as_student & @project_owner.sections_as_student).any?

    @project_comments = CodeReviewComment.where(
      storage_app_id: @storage_app_id,
      project_version: params[:project_version]
    )

    render json: @project_comments
  end

  private

  def decrypt_channel_id
    # TO DO: handle errors in decrypting, or can't find user
    @storage_id, @storage_app_id = storage_decrypt_channel_id(params[:channel_id])
    @project_owner = User.find_by(id: user_id_for_storage_id(@storage_id))
  end

  # TO DO: modify permit_params to handle other parameters (eg, section ID)
  def code_review_comments_params
    params.permit(
      :project_version,
      :comment,
      :is_resolved
    )
  end
end
