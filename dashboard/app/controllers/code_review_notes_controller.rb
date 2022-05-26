class CodeReviewNotesController < ApplicationController
  before_action :authenticate_user!

  load_and_authorize_resource :code_review_note, only: [:update]

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
    @code_review_note.save!
    render json: @code_review_note.summarize
  end

  # PATCH /code_review_notes/:id
  # Currently, updating is_resolved the note is the only allowed update.
  def update
    params.require(:id)

    if params[:isResolved]
      @code_review_note.update!(is_resolved: params[:isResolved])
    end

    render json: @code_review_note.summarize
  end
end
