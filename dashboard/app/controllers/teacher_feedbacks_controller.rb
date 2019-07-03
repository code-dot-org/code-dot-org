class TeacherFeedbacksController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # Feedback from any teacher who has provided feedback to a
  # student on any level
  def index
  end
end
