# Grades and persists a response, creating or updating as needed. Shared by
# QuizQuestionResponsesController#create and QuizAttemptsController#update.
module QuizResponseGrading
  extend ActiveSupport::Concern

  private def grade_and_save_response!(attempt, question, response_data)
    if question.auto_gradable?
      grade = question.grade(response_data)
      grading_status = 'auto_graded'
    else
      grade = {score: nil, max_score: nil}
      grading_status = 'ungraded'
    end

    response = QuizQuestionResponse.find_or_initialize_by(quiz_attempt: attempt, quiz_question: question)
    response.update!(
      response_data: response_data,
      score: grade[:score],
      max_score: grade[:max_score],
      grading_status: grading_status
    )
    response
  end
end
