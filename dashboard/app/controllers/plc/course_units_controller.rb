class Plc::CourseUnitsController < ApplicationController
  load_and_authorize_resource

  def show
  end

  def submit_new_questions_and_answers
    JSON.parse(new_questions_params).each do |question|
      Plc::EvaluationQuestion.create(plc_course_unit: @course_unit, question: question)
    end

    JSON.parse(new_answers_params).each do |question_id, answer_list|
      answer_list.each do |answer_properties|
        Plc::EvaluationAnswer.create(plc_evaluation_question_id: question_id,
                                     answer: answer_properties['answer'],
                                     weight: answer_properties['weight'] || 1,
                                     plc_learning_module_id: answer_properties['learningModuleId'] == '' ? nil : answer_properties['learningModuleId'])
      end
    end
    redirect_to @course_unit
  end

  private

  # Never trust parameters from the scary internet, only allow the white list through.
  def new_questions_params
    params.require(:newQuestionsList)
  end

  def new_answers_params
    params.require(:newAnswersList)
  end
end
