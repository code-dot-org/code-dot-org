class TeacherFeedbacksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource
  after_action :set_seen_on_feedback_page_at, only: :index

  # Feedback from any teacher who has provided feedback to the current
  # student on any level
  def index
    @teacher_feedbacks = @teacher_feedbacks.map {|feedback| feedback.attributes.merge(feedback&.script_level&.summary_for_feedback)}
  end

  def set_seen_on_feedback_page_at
    TeacherFeedback.where(student_id: current_user.id).update_all(seen_on_feedback_page_at: DateTime.now)
  end
end
