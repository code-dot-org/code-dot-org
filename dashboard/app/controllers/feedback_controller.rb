class FeedbackController < ApplicationController
  before_action :authenticate_user!

  def index
    @all_feedback = TeacherFeedback.where(student_id: current_user.id)
  end
end
