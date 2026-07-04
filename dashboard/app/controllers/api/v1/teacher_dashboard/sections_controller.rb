# Bootstrap endpoint for the teacher-dashboard SPA migration: the section
# list + saved ordering that legacy TeacherDashboardController#show embeds
# in the page as `data-dashboard` JSON.
class Api::V1::TeacherDashboard::SectionsController < Api::V1::JSONApiController
  # force_json must precede authenticate_user! so a signed-out request gets
  # 401 JSON, not Devise's navigational 302 to sign-in (same pattern as
  # Api::V1::Users::SettingsController).
  before_action :force_json
  before_action :authenticate_user!
  # Legacy denies students the dashboard page (CanCan AccessDenied redirect,
  # teacher_dashboard_controller.rb:8-19). No existing ability rule expresses
  # "may instruct sections" at the class level, and adding one is out of
  # bounds, so deny participants explicitly.
  before_action :forbid_students

  # GET /api/v1/teacher_dashboard/sections
  # Transcription of TeacherDashboardController#show lines 23-25 (section
  # list incl. the includes to avoid N+1 on section_instructors) and line 33
  # (section_order).
  def index
    prevent_caching
    sections = current_user.sections_instructed.
      includes(section_instructors: {instructor: :primary_contact_info}).
      map(&:concise_summarize)
    section_order = UserPreference.find_by(user_id: current_user.id)&.section_order
    render json: {sections: sections, section_order: section_order}
  end

  private def forbid_students
    head :forbidden if current_user.student?
  end
end
