class LessonFeedbacksController < ApplicationController
  # before_action :authenticate_teacher!
  # Not sure what should be private... come back to this.

  def create
    feedback = LessonFeedback.new(lesson_feedback_params)

    if feedback.save
      render json: feedback, status: :created
    else
      render json: {errors: feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    feedback = LessonFeedback.find(params[:id])

    if feedback.update(lesson_feedback_params)
      render json: feedback
    else
      render json: {errors: feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def lesson_feedback_params
    params.require(:lesson_feedback).permit(
      :teacher_id,
      :student_id,
      :section_id,
      :lesson_id,
      :saved_feedback,
      :submitted_feedback,
      :submitted_at,
      resources: {}
    )
  end
end
