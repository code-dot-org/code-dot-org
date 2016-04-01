class Plc::CourseViewController < ApplicationController
  before_filter :dashboard_view_requirements

  def render_dashboard
    @enrollments = current_user.plc_enrollments
  end

  private
  def dashboard_view_requirements
    authenticate_user!
    require_teacher
  end
end
