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

    # We need to know which feedback is the latest for a level/script in order to determine
    # if the level is awaiting another review from the teacher. (A level is awaiting review if it was marked
    # as keep working by the teacher and then the student made progress)
    #
    # Here we have a map from level/script to true if we've marked the latest feedback in our list
    marked_latest_for_level = {}

    @feedbacks_as_student_with_level_info = @feedbacks_as_student.map do |feedback|
      level_feedback_key = [feedback.level_id, feedback.script_id].join('_')
      is_latest = !marked_latest_for_level[level_feedback_key]

      if is_latest
        marked_latest_for_level[level_feedback_key] = true
      end

      feedback.summarize.merge({is_latest_for_level: is_latest}).merge(feedback&.get_script_level&.summary_for_feedback)
    end
  end

  def set_seen_on_feedback_page_at
    @teacher_feedbacks.where(student_id: current_user.id).update_all(seen_on_feedback_page_at: DateTime.now)
  end
end
