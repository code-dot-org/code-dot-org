class TeacherFeedbacksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource
  after_action :set_seen_on_feedback_page_at, only: :index

  # Feedback from any verified teacher who has provided feedback to the current
  # student on any level
  def index
    scope = {
      level: {
        script_levels: {
          lesson: :script
        }
      }
    }
    @feedbacks_as_student = @teacher_feedbacks.order(created_at: :desc).includes(scope).select do |feedback|
      UserPermission.where(
        user_id: feedback.teacher_id,
        permission: 'authorized_teacher'
      )
    end

    @feedbacks_as_student_with_level_info = @feedbacks_as_student.map do |feedback|
      feedback.summarize.merge(feedback&.get_script_level&.summary_for_feedback)
    end
  end

  def set_seen_on_feedback_page_at
    @teacher_feedbacks.where(student_id: current_user.id).update_all(seen_on_feedback_page_at: DateTime.now)
  end
end
