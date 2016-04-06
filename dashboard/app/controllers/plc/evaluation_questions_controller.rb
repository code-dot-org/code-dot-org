class Plc::EvaluationQuestionsController < ApplicationController
  load_and_authorize_resource

  # DELETE /plc/evaluation_questions/1
  # DELETE /plc/evaluation_questions/1.json
  def destroy
    course_unit = @evaluation_question.plc_course_unit
    @evaluation_question.destroy
    redirect_to course_unit
  end
end
