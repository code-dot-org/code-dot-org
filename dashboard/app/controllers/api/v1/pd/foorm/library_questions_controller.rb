class Api::V1::Pd::Foorm::FormsController < ApplicationController
  include Api::CsvDownload

  # GET api/v1/pd/foorm/library_questions/:library_name
  def get_library_questions_for_library
    library_questions = Foorm::Form.where(library_name: params[:library_name])
    if library_questions
      data_to_return = [].tap do |library|
        library_questions.each do |library_question|
          library << {
            id: question.id,
            question: JSON.parse(library_question.question),
            name: library_question.name,
            published: question.published,
            version: question.version
          }
        end
      end
      render json: data_to_return
    else
      render json: {}
    end
  end

  # TBD
  def validate_library_question
    # TBD
  end
end
