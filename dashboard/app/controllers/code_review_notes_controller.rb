class CodeReviewNotesController < ApplicationController
  before_action :authenticate_user!

  load_and_authorize_resource :code_review_note, only: [:toggle_resolved]

  # POST /code_review_notes
  def create
    params.require([:comment, :codeReviewId])

    @code_review_note = CodeReviewNote.new(
      {
        comment: params[:comment],
        code_review_request_id: params[:codeReviewId],
        commenter_id: current_user.id,
        is_resolved: false
      }
    )

    # We wait to authorize until this point because we need to know
    # who owns the project that the comment is associated with.
    authorize! :create, @code_review_note

    if @code_review_note.save
      return render json: @code_review_note.summarize
    else
      return head :bad_request
    end
  end

  # PATCH /code_review_notes/:id/toggle_resolved
  def toggle_resolved
    if @code_review_note.update(is_resolved: params[:is_resolved])
      return head :ok
    else
      return head :bad_request
    end
  end
end
