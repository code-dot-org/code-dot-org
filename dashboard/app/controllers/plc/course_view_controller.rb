class Plc::CourseViewController < ApplicationController
  before_filter :require_teacher

  def render_dashboard
    @enrollments = current_user.plc_enrollments
  end
end
