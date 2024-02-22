class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section_summary = @section.summarize
    @sections = current_user.sections_instructed.map(&:summarize)
    @locale_code = request.locale
    view_options(full_width: true)
  end

  def parent_letter
    @section_summary = @section.summarize
    @sections = current_user.sections_instructed.map(&:summarize)
    render layout: false
  end
end
