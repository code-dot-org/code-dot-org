class TeacherFeedbacksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource
  after_action :set_seen_on_feedback_page_at, only: :index

  # Feedback from any verified teacher who has provided feedback to the current
  # student on any level
  def index
    @feedbacks_as_student = @teacher_feedbacks.select do |feedback|
      feedback.student_id == current_user.id && User.find(feedback.teacher_id).authorized_teacher?
    end

    @feedbacks_as_student_with_level_info = @feedbacks_as_student.map {|feedback| feedback.attributes.merge(feedback&.script_level&.summary_for_feedback)}
  end

  def set_seen_on_feedback_page_at
    TeacherFeedback.where(student_id: current_user.id).update_all(seen_on_feedback_page_at: DateTime.now)
  end
end
