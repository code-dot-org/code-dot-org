class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    @locale_code = request.locale
    view_options(full_width: true, no_padding_container: true)
  end

  def redirect_to_newest_section
    user_id = current_user.id
    section_id = get_users_most_recent_section_id(user_id)
    redirect_to "/teacher_dashboard/sections/#{section_id}/progress"
  end

  def parent_letter
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    render layout: false
  end

  # finds user's newest section id
  private def get_users_most_recent_section_id(user_id)
    user = User.find(user_id)
    user.sections_instructed.order(created_at: :desc).first.id
  end
end
