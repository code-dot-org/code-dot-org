class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    @locale_code = request.locale
    view_options(full_width: true, no_padding_container: true)
  end

  def parent_letter
    @section_summary = @section.selected_section_summarize
    @sections = current_user.sections_instructed.map(&:concise_summarize)
    render layout: false
  end
end
