class TeacherFeedbacksController < ApplicationController
  # GET /teacher_feedbacks/new
  def new
    @teacher_feedback = TeacherFeedback.new
  end

  # POST /teacher_feedbacks
  # POST /teacher_feedbacks.json
  def create
    teacher_feedback = TeacherFeedback.new(teacher_feedback_params)

    if teacher_feedback.save
      head :created
    else
      head :bad_request
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def teacher_feedback_params
    params.permit(:comment, :student_id, :level_id, :section_id)
  end
end
