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

  # GET /lesson_feedbacks/saved_feedback?student_id=...&lesson_id=...
  def saved_feedback
    student_id = params[:student_id]
    lesson_id = params[:lesson_id]
    feedback = LessonFeedback.find_by(student_id: student_id, lesson_id: lesson_id)
    if feedback
      render json: feedback
    else
      render json: {errors: feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def lesson_feedback_params
    params.permit(
      :teacher_id,
      :student_id,
      :section_id,
      :lesson_id,
      :saved_feedback,
      :submitted_feedback,
      :submitted_at,
      resources: [:recommended_action, :resource_name, :resource_link]
    )
  end
end
