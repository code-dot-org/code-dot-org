class TeacherFeedbacksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # Feedback from any teacher who has provided feedback to the current
  # student on any level
  def index
    @teacher_feedbacks = @teacher_feedbacks.map {|feedback| feedback.attributes.merge(feedback&.script_level&.summary_for_feedback)}
  end
end
