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

    @feedbacks_by_level = []

    feedbacks_grouped_by_level = @feedbacks_as_student.group_by {|feedback| "#{feedback.script_id}_#{feedback.level_id}"}

    feedbacks_grouped_by_level.each do |_, feedbacks|
      level_details = feedbacks[0].get_script_level&.summary_for_feedback

      summarized_feedbacks = feedbacks.each_with_index.map do |feedback, i|
        is_latest = i == 0
        feedback.summarize(is_latest)
      end

      level_feedbacks = level_details.merge({feedbacks: summarized_feedbacks})

      @feedbacks_by_level.push(level_feedbacks)
    end
  end

  def set_seen_on_feedback_page_at
    @teacher_feedbacks.where(student_id: current_user.id).update_all(seen_on_feedback_page_at: DateTime.now)
  end
end
