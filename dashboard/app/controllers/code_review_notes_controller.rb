class CodeReviewNotesController < ApplicationController
  before_action :authenticate_user!

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

    # TODO: fetch project and authorize
    # check that user is authorized to leave a comment
    # check that code review exists and is open

    # We wait to authorize until this point because we need to know
    # who owns the project that the comment is associated with.
    # authorize! :create, @code_review_note, @project_owner, @project_id

    if @code_review_note.save
      return render json: @code_review_note.summarize
    else
      return head :bad_request
    end
  end
end
