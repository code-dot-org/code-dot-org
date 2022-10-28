class CodeReviewCommentsController < ApplicationController
  before_action :authenticate_user!

  load_and_authorize_resource :code_review_comment, only: [:update, :destroy]

  # POST /code_review_comments
  def create
    params.require([:comment, :codeReviewId])

    @code_review_comment = CodeReviewComment.new(
      {
        comment: params[:comment],
        code_review_id: params[:codeReviewId],
        commenter_id: current_user.id,
        is_resolved: false
      }
    )

    # We wait to authorize until this point because we need to know
    # who owns the project that the comment is associated with.
    authorize! :create, @code_review_comment
    @code_review_comment.save!
    render json: @code_review_comment.summarize
  end

  # PATCH /code_review_comments/:id
  # Currently, updating is_resolved the note is the only allowed update.
  def update
    params.require(:id)

    if params[:isResolved]
      @code_review_comment.update!(is_resolved: params[:isResolved])
    end

    render json: @code_review_comment.summarize
  end

  # DELETE /code_review_comments/:id
  def destroy
    if @code_review_comment.delete
      return head :ok
    else
      return head :bad_request
    end
  end
end
