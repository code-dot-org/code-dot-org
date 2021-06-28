class CodeReviewCommentsController < ApplicationController
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
    @code_review_comment = CodeReviewComment.new(code_review_comments_params)

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
    if @code_review_comment.update(code_review_comments_params)
      head :ok
    else
      head :bad_request
    end
  end

  # PATCH /code_review_comments/:id/resolve
  def resolve
    if @code_review_comment.update(is_resolved: true)
      head :ok
    else
      head :bad_request
    end
  end

  # DELETE /code_review_comments/:id
  def destroy
    if @code_review_comment.delete
      head :ok
    else
      head :bad_request
    end
  end

  # require project id, project version
  # GET /code_review_comments/project_comments
  def project_comments
    @project_comments = CodeReviewComment.where(
      channel_token_id: params[:channel_token_id],
      project_version: params[:project_version]
    )

    render json: @project_comments
  end

  private

  # TO DO: modify permit_params to handle other parameters (eg, section ID)
  def code_review_comments_params
    params.permit(
      :channel_token_id,
      :project_version,
      :commenter_id,
      :comment,
      :is_resolved
    )
  end
end
