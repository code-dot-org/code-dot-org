class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section

  def show
    @section = @section.summarize
    @visible_sections = current_user.sections.where(hidden: false).map(&:summarize)
    @sections = current_user.sections.map(&:summarize)
  end
end
