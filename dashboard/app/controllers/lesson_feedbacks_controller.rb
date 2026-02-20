class LessonFeedbacksController < ApplicationController
  before_action :authenticate_user!

  load_and_authorize_resource except: [:show_by_student, :saved_feedback]

  def create
    @lesson_feedback.assign_attributes(lesson_feedback_params)

    if @lesson_feedback.save
      render json: @lesson_feedback, status: :created
    else
      render json: {errors: @lesson_feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def update
    if @lesson_feedback.update(lesson_feedback_params)
      render json: @lesson_feedback
    else
      render json: {errors: @lesson_feedback.errors.full_messages}, status: :unprocessable_entity
    end
  end

  def show_by_student
    feedback = LessonFeedback.includes(:teacher, lesson: :script).where(student_id: current_user.id).where.not(submitted_at: nil).order(updated_at: :desc)

    feedback_with_additional_data = feedback.map do |f|
      f.as_json.merge(
        'teacher_name' => f.teacher.name,
        'lesson_title' => f.lesson.localized_title,
        'lesson_start_url' => f.lesson.start_url
      )
    end

    render json: feedback_with_additional_data
  end

  # GET /lesson_feedbacks/saved_feedback?student_id=...&lesson_id=...
  def saved_feedback
    student = User.find(params[:student_id])
    return head :forbidden unless student&.student_of?(current_user)

    feedback = LessonFeedback.find_by!(
      student_id: params[:student_id],
      lesson_id: params[:lesson_id]
    )

    render json: feedback
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
