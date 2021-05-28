class Api::V1::Pd::Foorm::LibraryQuestionsController < ApplicationController
  # POST api/v1/pd/foorm/library_questions/validate_library_question
  def validate_library_question
    authorize! :validate_library_question, :pd_foorm

    library_question = Foorm::LibraryQuestion.new(question: params[:question].to_json)
    library_question.validate_library_question

    if library_question.errors.empty?
      return render status: 200, json: {}
    else
      return render status: 500, json: {error: library_question.errors[:question].join(', ')}
    end
  end
end
