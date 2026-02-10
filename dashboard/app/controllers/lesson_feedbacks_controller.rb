class LessonFeedbacksController < ApplicationController
  before_action :authenticate_user!

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

  def show_by_student
    feedback = LessonFeedback.where(student_id: params[:student_id])

    render json: feedback
  end

  # GET /lesson_feedbacks/saved_feedback?student_id=...&lesson_id=...
  def saved_feedback
    feedback = LessonFeedback.find_by!(
      student_id: params[:student_id],
      lesson_id: params[:lesson_id]
    )

    render json: feedback
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
