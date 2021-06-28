class CodeReviewCommentsController < ApplicationController
  # TO DO: Permissioning

  # POST /code_review_comments
  def create
    @code_review_comment = CodeReviewComment.new(code_review_comments_params)

    if @code_review_comment.save
      render json: @code_review_comment
    else
      head :bad_request
    end
  end

  # require code_review_comment_id, permit comment? is_resolved?
  # no update action in teacher feedback -- maybe this is a better pattern (no updates)?
  def update
  end

  # may be able to remove and implement using update
  def resolve
  end

  # require code_review_comment_id
  def destroy
    @code_review_comment = CodeReviewComment.find_by(params[:id])

    if @code_review_comment.delete
      head :ok
    else
      head :bad_request
    end
  end

  # require project id, project version
  def project_comments
    @project_comments = CodeReviewComment.where(
      channel_token_id: params[:channel_token_id],
      project_version: params[:project_version]
    )

    render json: @project_comments
  end

  private

  # TO DO: permit params
  # require permit description: https://stackoverflow.com/questions/18424671/what-is-params-requireperson-permitname-age-doing-in-rails-4
  # require commenter id, project id, project version, comment
  def code_review_comments_params
    params.require(:code_review_comment).permit(
      :channel_token_id,
      :project_version,
      :commenter_id,
      :comment
    )
  end
end
