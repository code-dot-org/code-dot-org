class Plc::CourseViewController < ApplicationController
  before_filter :authenticate_user!

  def render_dashboard
    authorize! :read, Plc::Course

    @enrollments = current_user.plc_enrollments
  end
end
