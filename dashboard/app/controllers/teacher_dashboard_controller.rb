class TeacherDashboardController < ApplicationController
  load_and_authorize_resource :section, :course

  def show
    @section_summary = @section.summarize
    @section = @section
    @course = @course
    @sections = current_user.sections.map(&:summarize)
  end
end
