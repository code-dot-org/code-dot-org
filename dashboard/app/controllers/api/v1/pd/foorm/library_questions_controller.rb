class Api::V1::Pd::Foorm::LibraryQuestionsController < ApplicationController
  # POST api/v1/pd/foorm/library_questions/validate_library_question
  def validate_library_question
    authorize! :validate_library_question, :pd_foorm

    library_question = params[:id] ?
                         Foorm::LibraryQuestion.find(params[:id]) :
                         Foorm::LibraryQuestion.new
    library_question.question = params[:question].to_json
    library_question.validate_question

    if library_question.errors.empty?
      return render status: :ok, json: {}
    else
      return render status: :internal_server_error, json: {error: library_question.errors[:question].join(', ')}
    end
  end
end
