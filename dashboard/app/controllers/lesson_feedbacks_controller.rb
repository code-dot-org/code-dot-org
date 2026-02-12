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
    student_id = params[:student_id]
    if student_id.to_i != current_user.id
      raise CanCan::AccessDenied.new('Students can only view their own lesson feedback')
    end

    feedback = LessonFeedback.includes(:teacher, lesson: :script).where(student_id: student_id).order(updated_at: :desc)

    feedback_with_additional_data = feedback.map do |f|
      f.as_json.merge(
        'teacherName' => f.teacher.name,
        'lessonTitle' => f.lesson.localized_title,
        'lessonStartUrl' => f.lesson.start_url
      )
    end

    render json: feedback_with_additional_data
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
